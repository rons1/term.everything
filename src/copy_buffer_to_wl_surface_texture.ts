import cpp from "./c_interop.ts";
import { never_default } from "./never_default.ts";
import { wl_surface as w, wl_buffer } from "./protocols/wayland.xml.ts";
import { Object_ID } from "./wayland_types.ts";
import { Wayland_Client } from "./Wayland_Client.ts";
import { pointer } from "./objects/wl_pointer.ts";
import { Map_State } from "./objects/wl_shm_pool.ts";
import { createCanvas, ImageData } from "canvas";

export const copy_buffer_to_wl_surface_texture = (
  s: Wayland_Client,
  surface_id: Object_ID<w>,
  z_index: number,
  buffer_id: Object_ID<wl_buffer> | null
) => {
  if (buffer_id === null) {
    s.drawable_surfaces.delete(surface_id);
    /**
     * Time to remove the texture from the surface
     */
    const surface = s.get_object(surface_id)?.delegate;
    if (!surface) {
      return;
    }
    surface.texture = null;

    return;
  }
  const surface = s.get_object(surface_id)?.delegate;
  if (!surface) {
    return;
  }

  const pool = s.get_object(buffer_id)?.delegate;
  if (!pool) {
    debugger;
    console.error("Could not get pool, cant' commit!");
    return;
  }

  if (pool.map_state === Map_State.destroyed) {
    console.error(
      "Could not get pool.buffer_pointer, cant' commit! pool",
      pool.wl_shm_pool_object_id,
      "buffer",
      buffer_id
    );
    return;
  }

  const buffer_info = pool.buffers.get(buffer_id);
  if (!buffer_info) {
    debugger;
    console.error("Could not get buffer_info, cant' commit!");
    return;
  }
  let x: number = surface.offset.x;
  let y: number = surface.offset.y;
  if (!surface.role) {
    return;
  }
  switch (surface.role.type) {
    case "xdg_popup":
      return;
    case "sub_surface":
      if (surface.role.data) {
        const sub_surface = s.get_object(surface.role.data)?.delegate;
        if (sub_surface) {
          x = sub_surface.position.x;
          y = sub_surface.position.y;
        }

        /**
         * @TODO should this be relative to the parent?
         */
      }
      break;
    case "xwayland_surface_v1":
      /**
       * @TODO
       */
      console.error("ON commit xwayland_surface_v1");
      break;
    case "xdg_toplevel":
      if (
        surface.xdg_surface_state
        // surface.xdg_surface_state.window_geometry
      ) {
        const xdg_surface_state = s.get_object(
          surface.xdg_surface_state
        )?.delegate;
        if (xdg_surface_state && xdg_surface_state.window_geometry) {
          // x = surface.xdg_surface_state.window_geometry.x;
          // y = surface.xdg_surface_state.window_geometry.y;
          // console.log(
          //   "reposition xdg_toplevel, ",
          //   x,
          //   y,
          //   "for surface",
          //   surface_id
          // );
        }
      }
      break;
    case "cursor":
      /**
       * @TODO is this right?
       */
      if (!surface.role.data) {
        /**
         * From the docs:
         * When the use as a cursor ends, the wl_surface is unmapped
         *
         * So I think that means if it isn't a cursor anymore,
         * we should not draw it
         */
        return;
      }

      x += pointer.window_position.x + surface.role.data.hotspot.x;
      y += pointer.window_position.y + surface.role.data.hotspot.y;
      break;
    default:
      never_default(surface.role);
      return;
  }

  surface.position.x = x;
  surface.position.y = y;
  surface.position.z = z_index;

  if (
    surface.texture &&
    (surface.texture.stride != buffer_info.stride ||
      (surface.texture && surface.texture.height != buffer_info.height) ||
      (surface.texture && surface.texture.width != buffer_info.width))
  ) {
    surface.texture = null;
  }
  if (!surface.texture) {
    const buf = new Uint8ClampedArray(buffer_info.stride * buffer_info.height);
    const sample = new ImageData(buf, buffer_info.width, buffer_info.height);
    const canvas = createCanvas(buffer_info.width, buffer_info.height);
    surface.texture = {
      stride: buffer_info.stride,
      width: buffer_info.width,
      height: buffer_info.height,
      buf,
      canvas,
      data: sample,
    };
  }

  const success = cpp.memcopy_buffer_to_uint8array(
    s.client_state,
    pool.wl_shm_pool_object_id,
    buffer_info.offset,
    surface.texture.buf,
    true
  );

  if (!success) {
    /**
     * @TODO on failure should we remove the buffer?
     * or the texture? or both?
     */
    console.error("Failed to copy buffer to uint8 array");
    return;
  }
  surface.texture.canvas
    .getContext("2d")
    .putImageData(surface.texture.data, 0, 0);

  s.drawable_surfaces.add(surface_id);
};
