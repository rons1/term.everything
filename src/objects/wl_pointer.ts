import { auto_release } from "../auto_release.ts";
import {
  wl_pointer_delegate as d,
  wl_pointer as w,
  wl_pointer_error,
  wl_surface,
} from "../protocols/wayland.xml.ts";

import { Object_ID } from "../wayland_types.ts";
import { Wayland_Client } from "../Wayland_Client.ts";

export class wl_pointer implements d {
  pointer_surface_id = new WeakMap<
    Wayland_Client,
    Object_ID<wl_surface> | null
  >();

  window_position = {
    x: 0,
    y: 0,
  };

  // last_pointer_enter_serial: number = 0;

  wl_pointer_set_cursor: d["wl_pointer_set_cursor"] = (
    s,
    object_id,
    _serial,
    surface_id,
    hotspot_x,
    hotspot_y
  ) => {
    /**
     * @TODO look at the serial and see it if valid (you are only supposed
     * to respond to the most recent serial)
     */
    // if (serial <= this.last_pointer_enter_serial) {
    //   console.error("Ignoring set cursor for stale serial");
    //   return;
    // }
    const pointer_surface_id = this.pointer_surface_id.get(s) ?? null;
    if (pointer_surface_id !== null && pointer_surface_id !== surface_id) {
      const old_pointer_surface = s.get_object(pointer_surface_id)?.delegate;
      if (old_pointer_surface) {
        old_pointer_surface.texture = null;
        // old_pointer_surface.destroy_texture(s, pointer_surface_id);
        if (old_pointer_surface?.role?.type === "cursor") {
          old_pointer_surface.role = null;
        }
      }
    }

    this.pointer_surface_id.set(s, surface_id);

    if (surface_id === null) {
      return;
    }
    const surface = s.get_object(surface_id)?.delegate;
    if (!surface) {
      console.error("surface not found");
      return;
    }
    if (surface.role !== null && surface.role.type !== "cursor") {
      s.send_error(
        object_id,
        wl_pointer_error.role,
        "pointer already has a role"
      );
      console.error("surface already has a role");
      return;
    }
    surface.role = {
      type: "cursor",
      data: {
        hotspot: {
          x: hotspot_x,
          y: hotspot_y,
        },
      },
    };
  };

  after_get_pointer = (_s: Wayland_Client, _object_id: Object_ID<w>) => {
    /** @TODO: Implement wl_pointer_set_cursor */
    /**
     * @TODO probably pointer.enter
     */
    // this.last_pointer_enter_serial += 1;
  };
  wl_pointer_release: d["wl_pointer_release"] = auto_release;
  wl_pointer_on_bind: d["wl_pointer_on_bind"] = (
    _s,
    _name,
    _interface_,
    _new_id,
    _version_number
  ) => {
    /** @TODO: Implement wl_pointer_on_bind */
  };
  static make(): w {
    return new w(new wl_pointer());
  }
}

export const pointer = new wl_pointer();
