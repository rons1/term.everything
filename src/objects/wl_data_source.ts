import { auto_release } from "../auto_release.ts";
import {
  wl_data_source_delegate as d,
  wl_data_source as w,
  wl_data_device_manager_dnd_action,
} from "../protocols/wayland.xml.ts";

export class wl_data_source implements d {
  mime_types: string[] = [];
  actions: wl_data_device_manager_dnd_action =
    wl_data_device_manager_dnd_action.none;

  wl_data_source_offer: d["wl_data_source_offer"] = (
    _s,
    _object_id,
    mime_type
  ) => {
    this.mime_types.push(mime_type);
  };
  wl_data_source_destroy: d["wl_data_source_destroy"] = auto_release;
  wl_data_source_set_actions: d["wl_data_source_set_actions"] = (
    _s,
    _object_id,
    dnd_actions
  ) => {
    this.actions = dnd_actions;
  };
  wl_data_source_on_bind: d["wl_data_source_on_bind"] = (
    _s,
    _name,
    _interface_,
    _new_id,
    _version_number
  ) => {
    /** @TODO: Implement wl_data_source_on_bind */
  };
  constructor() {}
  static make(): w {
    return new w(new wl_data_source());
  }
}
