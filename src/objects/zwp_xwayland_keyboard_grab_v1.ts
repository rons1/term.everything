import {
  zwp_xwayland_keyboard_grab_v1_delegate as d,
  zwp_xwayland_keyboard_grab_v1 as w,
} from "../protocols/wayland.xml.ts";

export class zwp_xwayland_keyboard_grab_v1 implements d {
  zwp_xwayland_keyboard_grab_v1_destroy: d["zwp_xwayland_keyboard_grab_v1_destroy"] =
    (_s, _object_id) => {
      /**
       * @TODO ungrab the keyboard
       */
      return true;
    };
  zwp_xwayland_keyboard_grab_v1_on_bind: d["zwp_xwayland_keyboard_grab_v1_on_bind"] =
    (_s, _name, _interface_, _new_id, _version_number) => {};
  constructor() {}
  static make(): w {
    return new w(new zwp_xwayland_keyboard_grab_v1());
  }
}
