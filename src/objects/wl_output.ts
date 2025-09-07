import { auto_release } from "../auto_release.ts";
import {
  wl_output_delegate as d,
  wl_output as w,
  wl_output_transform,
  wl_output_subpixel,
  wl_output_mode,
} from "../protocols/wayland.xml.ts";
import { virtual_monitor_size } from "../virtual_monitor_size.ts";
import { version } from "../wayland_types.ts";

export class wl_output implements d {
  version: version = 1;
  wl_output_release: d["wl_output_release"] = auto_release;
  wl_output_on_bind: d["wl_output_on_bind"] = (
    s,
    _name,
    _interface_,
    new_id,
    version
  ) => {
    this.version = version;

    w.scale(s, version, new_id, 1);
    w.name(s, version, new_id, "mon-os world");
    w.description(s, version, new_id, "The best monitor");

    w.geometry(
      s,
      new_id,
      0,
      0,
      virtual_monitor_size.width,
      virtual_monitor_size.height,
      wl_output_subpixel.unknown,
      "Very Good",
      "The best model",
      wl_output_transform.normal
    );
    w.mode(
      s,
      new_id,
      wl_output_mode.current,
      virtual_monitor_size.width,
      virtual_monitor_size.height,
      60_000
    );
    w.done(s, version, new_id);
  };
  static make(): w {
    return new w(new wl_output());
  }
}
