import { Global_Ids } from "../GlobalObjects.ts";
import {
  xdg_surface_delegate,
  xdg_surface as w,
  xdg_surface_error,
  xdg_popup as xdg_popup_funcs,
  wl_pointer,
  wl_surface,
  wl_keyboard,
  xdg_toplevel as xdg_toplevel_funcs,
  xdg_toplevel_state,
} from "../protocols/wayland.xml.ts";
import { virtual_monitor_size } from "../virtual_monitor_size.ts";
import { Object_ID, version } from "../wayland_types.ts";
import { Wayland_Client } from "../Wayland_Client.ts";
import { pointer } from "./wl_pointer.ts";
import { xdg_popup } from "./xdg_popup.ts";
import { xdg_toplevel } from "./xdg_toplevel.ts";

let global_enter_serial = 0;

export class xdg_surface implements xdg_surface_delegate {
  configure = (s: Wayland_Client): Promise<any> => {
    const { promise, resolve } = Promise.withResolvers<any>();
    const serial = this.latest_configure_serial;
    this.latest_configure_serial += 1;

    this.on_configure.set(serial, resolve);

    w.configure(s, this.xdg_surface_id, serial);
    return promise;
  };

  /**
   *
   * xdg_surface methods
   */

  xdg_surface_destroy: xdg_surface_delegate["xdg_surface_destroy"] = (
    s,
    object_id
  ) => {
    const surface_id = s.get_surface_id_from_role(object_id);
    if (surface_id) {
      const surface = s.get_object(surface_id)?.delegate;
      if (surface?.role?.data) {
        console.error(
          "xdg_surface Destroying surface with role",
          surface.role.type,
          "and data",
          surface.role.data
        );
        console.error(
          "xdg_surface Destroying surface before role is destroyed"
        );
        s.send_error(
          object_id,
          xdg_surface_error.defunct_role_object,
          "Surface destroyed before role"
        );
      }
    }

    s.unregister_role_to_surface(object_id);
    return true;
  };
  xdg_surface_get_toplevel: xdg_surface_delegate["xdg_surface_get_toplevel"] = (
    s,
    xdg_surface_object_id,
    id
  ) => {
    const surface_id = s.get_surface_id_from_role(xdg_surface_object_id);

    if (surface_id === undefined) {
      s.send_error(
        xdg_surface_object_id,
        xdg_surface_error.not_constructed,
        "surface not found"
      );
      return;
    }
    const surface = s.get_surface_from_role(xdg_surface_object_id);

    if (!surface) {
      s.send_error(
        xdg_surface_object_id,
        xdg_surface_error.not_constructed,
        "surface not found"
      );
      return;
    }
    if (!surface.role) {
      surface.role = {
        type: "xdg_toplevel",
        data: null,
      };
    }
    if (surface.role.type !== "xdg_toplevel") {
      s.send_error(
        xdg_surface_object_id,
        xdg_surface_error.defunct_role_object,
        "surface not found"
      );
      return;
    }
    if (surface.role.data !== null) {
      s.send_error(
        xdg_surface_object_id,
        xdg_surface_error.defunct_role_object,
        "surface already has a role"
      );
      return;
    }

    surface.role.data = id;

    s.add_object(id, xdg_toplevel.make());
    s.register_role_to_surface(id, surface_id);
    s.top_level_surfaces.add(id);

    xdg_toplevel_funcs.configure(
      s,
      id,
      virtual_monitor_size.width,
      virtual_monitor_size.height,
      [xdg_toplevel_state.maximized, xdg_toplevel_state.fullscreen]
    );

    /**
     * @TODO this is necessary, but whe?
     */
    w.configure(s, xdg_surface_object_id, 0);
    /**
     * @TODO should this be here?
     */

    s.get_global_binds(Global_Ids.wl_output)?.forEach((_version, output_id) => {
      wl_surface.enter(s, surface_id, output_id);
    });

    const serial = global_enter_serial++;
    s
      .get_global_binds(Global_Ids.wl_keyboard)
      ?.forEach((_version, keyboard_id) => {
        wl_keyboard.enter(s, keyboard_id, serial, surface_id, []);
      });

    s
      .get_global_binds(Global_Ids.wl_pointer)
      ?.forEach((version, pointer_id) => {
        wl_pointer.enter(
          s,
          pointer_id,
          serial,
          surface_id,
          pointer.window_position.x,
          pointer.window_position.y
        );
        wl_pointer.frame(s, version, pointer_id);
      });
    /**
     * commented because it
     * causes firefox to crash with:
     * "GraphicsCriticalError": "|[0][GFX1-]: (ubuntu:gnome) Wayland protocol error: listener function for opcode 2 of xdg_toplevel is NULL\n (t=0.503382) ",
     */
    // xdg_toplevel_funcs.configure_bounds(
    //   s,
    //   this.version,
    //   id,
    //   virtual_monitor_size.width,
    //   virtual_monitor_size.height
    // );
    /**
     * So with Xwayland clients, pointer enter doesn't stick?
     *
     * So let's do it again
     * after a timeout
     * @TODO where to actually put this?
     */
    setTimeout(() => {
      s.get_global_binds(Global_Ids.wl_pointer)?.forEach((_v, p) => {
        const pointer = s.get_object(p)?.delegate;
        if (!pointer) {
          return;
        }

        wl_pointer.enter(
          s,
          p,
          0,
          surface_id,
          pointer.window_position.x,
          pointer.window_position.y
        );
      });
    }, 100);
  };
  xdg_surface_get_popup: xdg_surface_delegate["xdg_surface_get_popup"] = (
    s,
    xdg_surface_object_id,
    id,
    parent,
    positioner_id
  ) => {
    const surface_id = s.get_surface_id_from_role(xdg_surface_object_id);

    if (surface_id === undefined) {
      s.send_error(
        xdg_surface_object_id,
        xdg_surface_error.not_constructed,
        "surface not found"
      );
      return;
    }
    const surface = s.get_surface_from_role(xdg_surface_object_id);

    if (!surface) {
      s.send_error(
        xdg_surface_object_id,
        xdg_surface_error.not_constructed,
        "surface not found"
      );
      return;
    }
    if (!surface.role) {
      surface.role = {
        type: "xdg_popup",
        data: null,
      };
    }
    if (surface.role.type !== "xdg_popup") {
      s.send_error(
        xdg_surface_object_id,
        xdg_surface_error.defunct_role_object,
        "surface not found"
      );
      return;
    }
    if (surface.role.data !== null) {
      s.send_error(
        xdg_surface_object_id,
        xdg_surface_error.defunct_role_object,
        "surface already has a role"
      );
      return;
    }
    const positioner = s.get_object(positioner_id)?.delegate;

    if (!positioner) {
      s.send_error(
        xdg_surface_object_id,
        xdg_surface_error.not_constructed,
        "positioner not found"
      );
      return;
    }
    surface.role.data = id;

    s.add_object(
      id,
      xdg_popup.make(
        this.version,
        parent,
        JSON.parse(JSON.stringify(positioner.state))
      )
    );
    s.register_role_to_surface(id, surface_id);

    xdg_popup_funcs.configure(
      s,
      id,
      0,
      0,
      virtual_monitor_size.width,
      virtual_monitor_size.height
    );
  };
  xdg_surface_set_window_geometry: xdg_surface_delegate["xdg_surface_set_window_geometry"] =
    (s, object_id, x, y, width, height) => {
      const surface = s.get_surface_from_role(object_id);
      if (!surface) {
        return;
      }
      surface.pending_update.xdg_surface_window_geometry = {
        x,
        y,
        width,
        height,
      };
    };
  xdg_surface_ack_configure: xdg_surface_delegate["xdg_surface_ack_configure"] =
    (_s, _object_id, serial) => {
      this.on_configure.get(serial)?.();

      for (const callback of this.on_configure) {
        if (callback[0] <= serial) {
          this.on_configure.delete(callback[0]);
        }
      }
    };
  xdg_surface_on_bind: xdg_surface_delegate["xdg_surface_on_bind"] = (
    _s,
    _name,
    _interface_,
    _new_id,
    _version_number
  ) => {};

  on_configure: Map<number, () => void> = new Map();
  latest_configure_serial = 0;
  window_geometry: {
    x: number;
    y: number;
    width: number;
    height: number;
  } = { x: 0, y: 0, width: 0, height: 0 };

  constructor(
    public version: version,
    public xdg_surface_id: Object_ID<w>
  ) {}
  static make(
    version: version,
    xdg_surface_id: xdg_surface["xdg_surface_id"]
  ): w {
    return new w(new xdg_surface(version, xdg_surface_id));
  }
}
