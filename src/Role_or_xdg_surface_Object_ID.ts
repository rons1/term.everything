import {
  xdg_surface as protocol_xdg_surface,
  xdg_popup,
  wl_subsurface,
  xdg_toplevel,
  xwayland_surface_v1,
} from "./protocols/wayland.xml.ts";
import { Object_ID } from "./wayland_types.ts";

/**
 * All the roles, plus xdg_surface (which is not technically a role)
 */

export type Role_or_xdg_surface_Object_ID =
  | Object_ID<protocol_xdg_surface>
  | Object_ID<xdg_popup>
  | Object_ID<wl_subsurface>
  | Object_ID<xdg_toplevel>
  | Object_ID<xwayland_surface_v1>;
