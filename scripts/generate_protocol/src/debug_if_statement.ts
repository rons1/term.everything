import { EventOrRequest, Interface } from "./Protocol.ts";

const debugtime_only = "wayland_debug_time_only()";
const debugtime_and_surface =
  "wayland_debug_time_only() && show_wayland_surface_and_buffer()";

export const debug_if_statement = (i: Interface, e: EventOrRequest) => {
  switch (i.$.name) {
    case "wl_display":
    case "wl_registry":
    // case "wl_surface":
    // case "wl_buffer":
    case "wl_callback":
    case "wl_keyboard":
      return debugtime_and_surface;
    case "wl_pointer":
      switch (e.$.name) {
        case "motion":
        case "frame":
        case "button":
        case "axis":
          return debugtime_and_surface;
        default:
          return debugtime_only;
      }
    default:
      return debugtime_only;
  }
};
