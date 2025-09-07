import {
  wl_output_transform,
  wl_region,
  wl_buffer,
  wl_surface,
} from "./protocols/wayland.xml.ts";
import { Object_ID } from "./wayland_types.ts";
import { xdg_surface as xdg_surface_state } from "./objects/xdg_surface.ts";

export interface Surface_Update {
  offset?: { x: number; y: number };
  /**
   * Damage is is surface local coordinates.
   */
  damage?: { x: number; y: number; width: number; height: number }[];
  /**
   * Damage buffer is in buffer local coordinates.
   */
  damage_buffer?: { x: number; y: number; width: number; height: number }[];
  buffer_scale?: number;
  buffer_transform?: wl_output_transform;
  input_region?: Object_ID<wl_region> | null;
  opaque_region?: Object_ID<wl_region> | null;

  buffer?: Object_ID<wl_buffer> | null;

  /**
   * You should unshift when adding to
   * this array so that the objects will
   * be added in the correct order. (ie
   * the ones added last will be on top)
   */
  add_sub_surface?: Object_ID<wl_surface>[];

  xdg_surface_window_geometry?: xdg_surface_state["window_geometry"];

  /**
   * set_child_position and z_oder_subsurfaces
   * take place whenever the parent surface is committed,
   * thus they are part of the SurfaceUpdate of the parent
   */
  set_child_position?: {
    child: Object_ID<wl_surface>;
    x: number;
    y: number;
  }[];
  /**
   * null means above or below the parent.
   */
  z_order_subsurfaces?: (
    | {
        type: "above";
        child_to_move: Object_ID<wl_surface>;
        relative_to: Object_ID<wl_surface> | null;
      }
    | {
        type: "below";
        child_to_move: Object_ID<wl_surface>;
        relative_to: Object_ID<wl_surface> | null;
      }
  )[];

  xwayland_surfarface_v1_serial?: {
    low: number;
    hi: number;
  };
}
