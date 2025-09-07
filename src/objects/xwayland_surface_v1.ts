import {
  xwayland_surface_v1_delegate as d,
  xwayland_surface_v1 as w,
} from "../protocols/wayland.xml.ts";

export class xwayland_surface_v1 implements d {
  xwayland_surface_v1_set_serial: d["xwayland_surface_v1_set_serial"] = (
    _s,
    _object_id,
    _serial_lo,
    _serial_hi
  ) => {
    /** @TODO: Implement xwayland_surface_v1_set_serial */
  };
  xwayland_surface_v1_destroy: d["xwayland_surface_v1_destroy"] = (
    s,
    object_id
  ) => {
    const surface = s.get_surface_from_role(object_id);

    if (!surface || !surface.role) {
      console.error(`xwayland_surface_v1_destroy: surface not found`);
      return true;
    }
    surface.role.data = null;
    return true;
  };
  xwayland_surface_v1_on_bind: d["xwayland_surface_v1_on_bind"] = (
    _s,
    _name,
    _interface_,
    _new_id,
    _version_number
  ) => {};
  constructor() {}
  static make(): w {
    return new w(new xwayland_surface_v1());
  }
}
