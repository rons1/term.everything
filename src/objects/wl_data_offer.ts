import { auto_release } from "../auto_release.ts";
import {
  wl_data_offer_delegate as d,
  wl_data_offer as w,
} from "../protocols/wayland.xml.ts";

export class wl_data_offer implements d {
  wl_data_offer_accept: d["wl_data_offer_accept"] = (
    _s,
    _object_id,
    _serial,
    _mime_type
  ) => {
    /** @TODO: Implement wl_data_offer_accept */
  };
  wl_data_offer_receive: d["wl_data_offer_receive"] = (
    _s,
    _object_id,
    _mime_type,
    _fd
  ) => {
    /** @TODO: Implement wl_data_offer_receive */
  };
  wl_data_offer_destroy: d["wl_data_offer_destroy"] = auto_release;
  wl_data_offer_finish: d["wl_data_offer_finish"] = (_s, _object_id) => {
    /** @TODO: Implement wl_data_offer_finish */
  };
  wl_data_offer_set_actions: d["wl_data_offer_set_actions"] = (
    _s,
    _object_id,
    _dnd_actions,
    _preferred_action
  ) => {
    /** @TODO: Implement wl_data_offer_set_actions */
  };
  wl_data_offer_on_bind: d["wl_data_offer_on_bind"] = (
    _s,
    _name,
    _interface_,
    _new_id,
    _version_number
  ) => {
    /** @TODO: Implement wl_data_offer_on_bind */
  };
  constructor() {}
  static make(): w {
    return new w(new wl_data_offer());
  }
}
