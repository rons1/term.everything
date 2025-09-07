import { auto_release } from "../auto_release.ts";
import {
  wl_data_device_delegate as d,
  wl_data_device as w,
  wl_seat,
} from "../protocols/wayland.xml.ts";
import { Object_ID } from "../wayland_types.ts";

export class wl_data_device implements d {
  wl_data_device_start_drag: d["wl_data_device_start_drag"] = (
    _s,
    _object_id,
    _source,
    _origin,
    _icon,
    _serial
  ) => {
    /** @TODO: Implement wl_data_device_start_drag */
  };
  wl_data_device_set_selection: d["wl_data_device_set_selection"] = (
    _s,
    _object_id,
    _source,
    _serial
  ) => {
    /** @TODO: Implement wl_data_device_set_selection */
  };
  wl_data_device_release: d["wl_data_device_release"] = auto_release;
  wl_data_device_on_bind: d["wl_data_device_on_bind"] = (
    _s,
    _name,
    _interface_,
    _new_id,
    _version_number
  ) => {
    /** @TODO: Implement wl_data_device_on_bind */
  };
  constructor(public seat: Object_ID<wl_seat>) {}
  static make(seat: Object_ID<wl_seat>): w {
    return new w(new wl_data_device(seat));
  }
}
