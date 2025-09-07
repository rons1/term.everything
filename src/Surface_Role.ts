import {
  xdg_toplevel,
  wl_surface,
  xdg_popup,
  wl_subsurface,
} from "./protocols/wayland.xml.ts";
import { Object_ID } from "./wayland_types.ts";

/**
 * Surface roles can be thought of as type.
 * [source ](https://wayland.app/protocols/wayland#wl_surface)
 * Things you may do:
 * 1. if unset you may assign it a role
 * 2. if assigned a role you may *not* change it to another role
 * 3. if assigned a role you may *may* assign it the *same* role
 * 4. The role may destroyed, allowing you assign it to the role again (maybe with different data), but not a different role.
 * 5. If the surface is destroyed before the role is destroyed, that is an error.
 */

export type Surface_Role =
  | Surface_Role_SubSurface
  | Surface_Role_xdg_popup
  | Surface_Role_toplevel
  | Surface_Role_cursor
  | Surface_Role_XWaylandSurface;

export type Surface_Role_with_Data<T extends Surface_Role> = T & {
  data: NonNullable<T["data"]>;
};

export type Surface_with_Role_and_Data<T extends Surface_Role["type"]> =
  wl_surface & {
    role: Surface_Role_with_Data<Extract<Surface_Role, { type: T }>>;
  };

export interface Surface_Role_xdg_popup {
  type: "xdg_popup";
  data: Object_ID<xdg_popup> | null;
}

export interface Surface_Role_cursor {
  type: "cursor";
  data: {
    hotspot: { x: number; y: number };
  } | null;
}

export interface Surface_Role_toplevel {
  type: "xdg_toplevel";
  data: Object_ID<xdg_toplevel> | null;
  // data: {
  //   parent: Object_ID<xdg_toplevel> | null;
  //   title: string | null;
  //   app_id: string;
  //   min_size: { width: number; height: number } | null;
  //   max_size: { width: number; height: number } | null;
  //   maximized: boolean;
  //   fullscreen: boolean;

  //   pending_state?: {
  //     min_size?: { width: number; height: number } | null;
  //     max_size?: { width: number; height: number } | null;
  //   };
  // } | null;
}

export interface Surface_Role_XWaylandSurface {
  type: "xwayland_surface_v1";
  data: {
    serial: {
      low: number;
      hi: number;
    } | null;
  } | null;
}

export interface Surface_Role_SubSurface {
  type: "sub_surface";
  data: Object_ID<wl_subsurface> | null;
  // data: {
  //   parent: Object_ID<wl_surface>;
  //   /**
  //    * @default true
  //    */
  //   sync: boolean;
  //   position: { x: number; y: number };
  // } | null;
}
