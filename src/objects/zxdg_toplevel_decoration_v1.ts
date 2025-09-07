import { auto_release } from "../auto_release.ts";
import {
  zxdg_toplevel_decoration_v1_delegate as d,
  zxdg_toplevel_decoration_v1 as w,
  xdg_toplevel,
  xdg_surface,
} from "../protocols/wayland.xml.ts";
import { Object_ID } from "../wayland_types.ts";

export class zxdg_toplevel_decoration_v1 implements d {
  zxdg_toplevel_decoration_v1_destroy: d["zxdg_toplevel_decoration_v1_destroy"] =
    auto_release;
  zxdg_toplevel_decoration_v1_set_mode: d["zxdg_toplevel_decoration_v1_set_mode"] =
    (s, _object_id, _mode) => {
      const surface = s.get_surface_from_role(this.xdg_toplevel);
      if (!surface) {
        return;
      }
      if (!surface.xdg_surface_state) {
        return;
      }
      const xdg_surface_state = s.get_object(
        surface.xdg_surface_state
      )?.delegate;
      if (!xdg_surface_state) {
        return;
      }
      const xdg_surface_id = xdg_surface_state.xdg_surface_id;
      xdg_surface_state.latest_configure_serial += 1;

      xdg_surface.configure(
        s,
        xdg_surface_id,
        xdg_surface_state.latest_configure_serial
      );
    };
  zxdg_toplevel_decoration_v1_unset_mode: d["zxdg_toplevel_decoration_v1_unset_mode"] =
    (s, _object_id) => {
      const surface = s.get_surface_from_role(this.xdg_toplevel);
      if (!surface) {
        return;
      }
      if (!surface.xdg_surface_state) {
        return;
      }
      const xdg_surface_state = s.get_object(
        surface.xdg_surface_state
      )?.delegate;
      if (!xdg_surface_state) {
        return;
      }
      const xdg_surface_id = xdg_surface_state.xdg_surface_id;
      xdg_surface_state.latest_configure_serial += 1;

      xdg_surface.configure(
        s,
        xdg_surface_id,
        xdg_surface_state.latest_configure_serial
      );
    };
  zxdg_toplevel_decoration_v1_on_bind: d["zxdg_toplevel_decoration_v1_on_bind"] =
    (_s, _name, _interface_, _new_id, _version_number) => {};
  constructor(public xdg_toplevel: Object_ID<xdg_toplevel>) {}
  static make(xdg_toplevel: Object_ID<xdg_toplevel>): w {
    return new w(new zxdg_toplevel_decoration_v1(xdg_toplevel));
  }
}
