import {
  xdg_toplevel_delegate as d,
  xdg_toplevel as w,
  xdg_toplevel_state,
} from "../protocols/wayland.xml.ts";
import { Wayland_Client } from "../Wayland_Client.ts";
import { Object_ID } from "../wayland_types.ts";
// import { configure } from "./xdg_surface.ts";
import { virtual_monitor_size } from "../virtual_monitor_size.ts";

export class xdg_toplevel implements d {
  xdg_toplevel_destroy: d["xdg_toplevel_destroy"] = (s, object_id) => {
    const surface = s.get_surface_from_role(object_id);

    s.unregister_role_to_surface(object_id);
    s.top_level_surfaces.delete(object_id);
    if (!surface?.role?.data) {
      return true;
    }

    surface.role.data = null;
    return true;
  };
  xdg_toplevel_set_parent: d["xdg_toplevel_set_parent"] = (
    _s,
    _object_id,
    parent
  ) => {
    this.parent = parent;
  };
  xdg_toplevel_set_title: d["xdg_toplevel_set_title"] = (
    _s,
    _object_id,
    title
  ) => {
    this.title = title;
  };
  xdg_toplevel_set_app_id: d["xdg_toplevel_set_app_id"] = (
    _s,
    _object_id,
    app_id
  ) => {
    this.app_id = app_id;
  };
  xdg_toplevel_show_window_menu: d["xdg_toplevel_show_window_menu"] = (
    _s,
    _object_id,
    _seat,
    _serial,
    _x,
    _y
  ) => {
    /** @TODO: Implement xdg_toplevel_show_window_menu */
  };
  xdg_toplevel_move: d["xdg_toplevel_move"] = (
    _s,
    _object_id,
    _seat,
    _serial
  ) => {
    /** @TODO: Implement xdg_toplevel_move */
  };
  xdg_toplevel_resize: d["xdg_toplevel_resize"] = (
    _s,
    _object_id,
    _seat,
    _serial,
    _edges
  ) => {
    /** @TODO: Implement xdg_toplevel_resize */
  };
  xdg_toplevel_set_max_size: d["xdg_toplevel_set_max_size"] = (
    _s,
    _object_id,
    width,
    height
  ) => {
    this.pending_state ??= {};
    this.pending_state.max_size = { width, height };
  };
  xdg_toplevel_set_min_size: d["xdg_toplevel_set_min_size"] = (
    _s,
    _object_id,
    width,
    height
  ) => {
    this.pending_state ??= {};
    this.pending_state.min_size = { width, height };
  };

  state_configuration = async (
    s: Wayland_Client,
    object_id: Object_ID<w>,
    state: {
      maximized: boolean;
      fullscreen: boolean;
    }
  ): Promise<boolean> => {
    // const data = s.get_role_data_from_role(object_id, "xdg_toplevel");
    // if (!data) {
    //   return false;
    // }
    const surface = s.get_surface_from_role(object_id);
    if (!surface) {
      return false;
    }
    if (!surface.xdg_surface_state) {
      return false;
    }
    const xdg_surface_state = s.get_object(surface.xdg_surface_state)?.delegate;
    if (!xdg_surface_state) {
      return false;
    }

    w.configure(
      s,
      object_id,
      virtual_monitor_size.width,
      virtual_monitor_size.height,

      (state.maximized ? [xdg_toplevel_state.maximized] : []).concat(
        state.fullscreen ? [xdg_toplevel_state.fullscreen] : []
      )
    );
    await xdg_surface_state.configure(s)

    // await configure(s, surface.xdg_surface_state);
    return true;
  };

  xdg_toplevel_set_maximized: d["xdg_toplevel_set_maximized"] = (
    s,
    object_id
  ) => {
    this.state_configuration(s, object_id, {
      maximized: true,
      fullscreen: this.fullscreen,
    }).then((should_change) => {
      if (!should_change) {
        return;
      }
      this.maximized = true;
    });
  };
  xdg_toplevel_unset_maximized: d["xdg_toplevel_unset_maximized"] = (
    s,
    object_id
  ) => {
    this.state_configuration(s, object_id, {
      maximized: true,
      fullscreen: this.fullscreen,
    }).then((should_change) => {
      if (!should_change) {
        return;
      }
      this.maximized = false;
    });
  };
  xdg_toplevel_set_fullscreen: d["xdg_toplevel_set_fullscreen"] = (
    s,
    object_id,
    _output
  ) => {
    this.state_configuration(s, object_id, {
      maximized: this.maximized,
      fullscreen: true,
    }).then((should_change) => {
      if (!should_change) {
        return;
      }
      this.fullscreen = true;
    });
  };
  xdg_toplevel_unset_fullscreen: d["xdg_toplevel_unset_fullscreen"] = (
    s,
    object_id
  ) => {
    this.state_configuration(s, object_id, {
      maximized: this.maximized,
      fullscreen: false,
    }).then((should_change) => {
      if (!should_change) {
        return;
      }
      this.fullscreen = false;
    });
  };
  xdg_toplevel_set_minimized: d["xdg_toplevel_set_minimized"] = (
    _s,
    _object_id
  ) => {
    /** @TODO: Implement xdg_toplevel_set_minimized */
  };
  xdg_toplevel_on_bind: d["xdg_toplevel_on_bind"] = (
    _s,
    _name,
    _interface_,
    _new_id,
    _version_number
  ) => {};

  parent: Object_ID<w> | null = null;
  title: string | null = null;
  app_id: string = "";
  min_size: { width: number; height: number } | null = null;
  max_size: { width: number; height: number } | null = null;
  maximized: boolean = false;
  fullscreen: boolean = false;

  pending_state?: {
    min_size?: { width: number; height: number } | null;
    max_size?: { width: number; height: number } | null;
  };

  constructor() {}
  static make(): w {
    return new w(new xdg_toplevel());
  }
}
