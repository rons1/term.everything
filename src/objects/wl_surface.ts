import {
  wl_surface_delegate,
  wl_surface as w,
  wl_surface_error,
  wl_buffer,
  wl_output_transform,
  wl_region,
  xdg_surface,
} from "../protocols/wayland.xml.ts";
import { Object_ID } from "../wayland_types.ts";
import { ImageData, Canvas } from "canvas";
import { Surface_Update } from "../Surface_Update.ts";
import { Surface_with_Role_and_Data, Surface_Role } from "../Surface_Role.ts";
import { apply_wl_surface_double_buffered_state } from "../apply_wl_surface_double_buffered_state.ts";
import { copy_buffer_to_wl_surface_texture } from "../copy_buffer_to_wl_surface_texture.ts";

export type Pending_Buffer_Updates = {
  surface: Object_ID<w>;
  buffer: Object_ID<wl_buffer> | null;
  z_index: number;
};

export class wl_surface implements wl_surface_delegate {
  position: {
    x: number;
    y: number;
    z: number;
  } = {
    x: 0,
    y: 0,
    z: 0,
  };
  texture: {
    stride: number;
    width: number;
    height: number;
    buf: Uint8ClampedArray;
    data: ImageData;
    canvas: Canvas;
  } | null = null;

  /**
   * xdg_surface is not a role,
   * but have to keep track anyway.
   */
  // xdg_surface_state: xdg_surface_state | null = null;
  xdg_surface_state: Object_ID<xdg_surface> | null = null;

  /**
   * null represents to draw the current surface.
   * By index, 0 is the bottom, and the last index is the top.
   */
  children_in_draw_order: (Object_ID<w> | null)[] = [null];

  role: Surface_Role | null = null;
  buffer_transform = wl_output_transform.normal;
  buffer_scale: number = 1;
  /**
   * Null means infinite, (ie we can accept input from everywhere)
   */
  input_region: Object_ID<wl_region> | null = null;
  /**
   * Unlink opaque region, null means empty!
   */
  opaque_region: Object_ID<wl_region> | null = null;

  pending_update: Surface_Update = {};
  offset: { x: number; y: number } = { x: 0, y: 0 };

  // texture: Size | null = null;

  /**
   * Don't care about regions for now.
   * Just need to clear this when the surface has
   * been drawn.
   */
  damaged: boolean = false;

  clear_role_data = () => {
    if (!this.role) {
      return;
    }
    this.role.data = null;
  };

  /**
   * If you pass it null that means it has
   * role data of any type.
   * @param of_type default is null
   * @returns
   */
  has_role_data_of_type = <T extends Surface_Role["type"]>(
    of_type: T | null = null
  ): this is Surface_with_Role_and_Data<T> => {
    if (!this.role) {
      return false;
    }
    if (this.role.type !== of_type) {
      return false;
    }
    if (this.role.data === null) {
      return false;
    }
    return true;
  };

  // destroy_texture = (s: Wayland_Client, surface_id: Object_ID<w>) => {
  //   // if (!this.texture) {
  //   //   return;
  //   // }

  //   delete s.texture_from_surface_id[surface_id];
  //   // cpp.destroy_texture_for_wl_surface(s.client_state, surface_id);
  //   // this.texture = null;
  // };

  /**
   *
   * Below are the wl_surface_delegate methods
   */

  wl_surface_destroy: wl_surface_delegate["wl_surface_destroy"] = (
    s,
    object_id
  ) => {
    // this.destroy_texture(s, object_id);

    if (!this.role?.data) {
      /**
       *
       */
      return true;
    }
    console.error(
      `wl_surface@${object_id} Destroying surface with role`,
      this.role.type,
      "and data",
      this.role.data
    );
    console.error("wl_sruface Destroying surface before role is destroyed");
    s.send_error(
      object_id,
      wl_surface_error.defunct_role_object,
      "Surface destroyed before role"
    );
    return true;
  };

  /**
   *
   * @param s
   * @param object_id
   * @param buffer
   * @param x
   * @param y
   * @returns
   */
  wl_surface_attach: wl_surface_delegate["wl_surface_attach"] = (
    s,
    object_id,
    buffer,
    x,
    y
  ) => {
    this.pending_update.buffer = buffer === 0 ? null : buffer;

    if (s.compositor_version < 5) {
      this.offset = { x, y };
      return;
    }
    if (x === 0 && y === 0) {
      return;
    }
    s.send_error(
      object_id,
      wl_surface_error.invalid_offset,
      "x and y must be 0 if version >= 5"
    );
  };
  wl_surface_damage: wl_surface_delegate["wl_surface_damage"] = (
    _s,
    _object_id,
    x,
    y,
    width,
    height
  ) => {
    this.pending_update.damage ??= [];
    this.pending_update.damage.push({ x, y, width, height });
  };
  wl_surface_frame: wl_surface_delegate["wl_surface_frame"] = (
    s,
    _object_id,
    callback
  ) => {
    s.add_frame_draw_request(callback);
  };
  wl_surface_set_opaque_region: wl_surface_delegate["wl_surface_set_opaque_region"] =
    (_s, _object_id, region) => {
      this.pending_update.opaque_region = region;
    };
  wl_surface_set_input_region: wl_surface_delegate["wl_surface_set_input_region"] =
    (_s, _object_id, region) => {
      this.pending_update.input_region = region;
    };

  wl_surface_commit: wl_surface_delegate["wl_surface_commit"] = (
    s,
    object_id
  ) => {
    const pending_buffer_texture_updates: Pending_Buffer_Updates[] = [];
    apply_wl_surface_double_buffered_state(
      s,
      object_id,
      false,
      pending_buffer_texture_updates,
      0
    );

    for (const { surface, buffer, z_index } of pending_buffer_texture_updates) {
      copy_buffer_to_wl_surface_texture(s, surface, z_index, buffer);
    }
    for (const { buffer } of pending_buffer_texture_updates) {
      /**
       * @TODO Is there every an occasion where the buffer would
       * be used more than once, ie can we always release it here?
       */
      if (buffer) {
        wl_buffer.release(s, buffer);
      }
    }
  };

  wl_surface_set_buffer_transform: wl_surface_delegate["wl_surface_set_buffer_transform"] =
    (_s, _object_id, transform) => {
      this.pending_update.buffer_transform = transform;
    };
  wl_surface_set_buffer_scale: wl_surface_delegate["wl_surface_set_buffer_scale"] =
    (_s, _object_id, scale) => {
      this.pending_update.buffer_scale = scale;
    };
  wl_surface_damage_buffer: wl_surface_delegate["wl_surface_damage_buffer"] = (
    _s,
    _object_id,
    x,
    y,
    width,
    height
  ) => {
    this.pending_update.damage_buffer ??= [];
    this.pending_update.damage_buffer.push({ x, y, width, height });
  };
  wl_surface_offset: wl_surface_delegate["wl_surface_offset"] = (
    _s,
    _object_id,
    x,
    y
  ) => {
    this.pending_update.offset = { x, y };
  };

  wl_surface_on_bind: wl_surface_delegate["wl_surface_on_bind"] = (
    _s,
    _name,
    _interface_,
    _new_id,
    _version
  ) => {
    return;
  };

  constructor() {}
  static make(): w {
    return new w(new wl_surface());
  }
}
