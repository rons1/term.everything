import {
  wl_region_delegate as d,
  wl_region as w,
} from "../protocols/wayland.xml.ts";
import { auto_release } from "../auto_release.ts";

export class wl_region implements d {
  wl_region_destroy: d["wl_region_destroy"] = auto_release;
  wl_region_add: d["wl_region_add"] = (
    _s,
    _object_id,
    _x,
    _y,
    _width,
    _height
  ) => {
    /** @TODO: Implement add */
  };
  wl_region_subtract: d["wl_region_subtract"] = (
    _s,
    _object_id,
    _x,
    _y,
    _width,
    _height
  ) => {
    /** @TODO: Implement subtract */
  };
  wl_region_on_bind: d["wl_region_on_bind"] = (
    _s,
    _name,
    _interface_,
    _new_id,
    _version
  ) => {};
  constructor() {}
  static make(): w {
    return new w(new wl_region());
  }
}
