import {
  wl_buffer as wl_buffer_id,
  wl_compositor as wl_compositor_id,
  wl_data_device_manager as wl_data_device_manager_id,
  wl_data_device as wl_data_device_id,
  wl_data_offer as wl_data_offer_id,
  wl_data_source as wl_data_source_id,
  wl_display as wl_display_id,
  wl_keyboard as wl_keyboard_id,
  wl_output as wl_output_id,
  wl_pointer as wl_pointer_id,
  wl_region as wl_region_id,
  wl_registry as wl_registry_id,
  wl_seat as wl_seat_id,
  wl_shm as wl_shm_id,
  wl_shm_pool as wl_shm_pool_id,
  wl_subcompositor as wl_subcompositor_id,
  wl_subsurface as wl_subsurface_id,
  wl_surface as wl_surface_id,
  xdg_popup as xdg_popup_id,
  xdg_positioner as xdg_positioner_id,
  xdg_surface as xdg_surface_id,
  xdg_toplevel as xdg_toplevel_id,
  xdg_wm_base as xdg_wm_base_id,
  xwayland_shell_v1 as xwayland_shell_v1_id,
  xwayland_surface_v1 as xwayland_surface_v1_id,
  zwp_xwayland_keyboard_grab_manager_v1 as zwp_xwayland_keyboard_grab_manager_v1_id,
  zwp_xwayland_keyboard_grab_v1 as zwp_xwayland_keyboard_grab_v1_id,
} from "./protocols/wayland.xml.ts";
import { wl_compositor } from "./objects/wl_compositor.ts";
import { wl_data_device_manager } from "./objects/wl_data_device_manager.ts";
import { wl_data_device } from "./objects/wl_data_device.ts";
import { wl_data_offer } from "./objects/wl_data_offer.ts";
import { wl_data_source } from "./objects/wl_data_source.ts";
import { wl_display } from "./objects/wl_display.ts";
import { wl_keyboard } from "./objects/wl_keyboard.ts";
import { wl_output } from "./objects/wl_output.ts";
import { wl_pointer } from "./objects/wl_pointer.ts";
import { wl_region } from "./objects/wl_region.ts";
import { wl_registry } from "./objects/wl_registry.ts";
import { wl_seat } from "./objects/wl_seat.ts";
import { wl_shm_pool } from "./objects/wl_shm_pool.ts";
import { wl_shm } from "./objects/wl_shm.ts";
import { wl_subcompositor } from "./objects/wl_subcompositor.ts";
import { wl_subsurface } from "./objects/wl_subsurface.ts";
import { wl_surface } from "./objects/wl_surface.ts";
import { xdg_popup } from "./objects/xdg_popup.ts";
import { xdg_positioner } from "./objects/xdg_positioner.ts";
import { xdg_surface } from "./objects/xdg_surface.ts";
import { xdg_toplevel } from "./objects/xdg_toplevel.ts";
import { xdg_wm_base } from "./objects/xdg_wm_base.ts";
import { xwayland_shell_v1 } from "./objects/xwayland_shell_v1.ts";
import { xwayland_surface_v1 } from "./objects/xwayland_surface_v1.ts";
import { zwp_xwayland_keyboard_grab_manager_v1 } from "./objects/zwp_xwayland_keyboard_grab_manager_v1.ts";
import { zwp_xwayland_keyboard_grab_v1 } from "./objects/zwp_xwayland_keyboard_grab_v1.ts";

import { Object_ID } from "./wayland_types.ts";
import { Wayland_Object } from "./Wayland_Object.ts";

export type Object_ID_To_Wayland_Object<T extends Object_ID> = Wayland_Object<
  Extract<Object_ID_To_Wayland_object_union, { id: T }>["object_type"]
>;

export type Object_ID_To_Wayland_object_union =
  | {
      id: Object_ID<wl_compositor_id>;
      object_type: wl_compositor;
    }
  | {
      id: Object_ID<wl_data_device_manager_id>;
      object_type: wl_data_device_manager;
    }
  | {
      id: Object_ID<wl_data_device_id>;
      object_type: wl_data_device;
    }
  | {
      id: Object_ID<wl_data_offer_id>;
      object_type: wl_data_offer;
    }
  | {
      id: Object_ID<wl_data_source_id>;
      object_type: wl_data_source;
    }
  | {
      id: Object_ID<wl_display_id>;
      object_type: wl_display;
    }
  | {
      id: Object_ID<wl_keyboard_id>;
      object_type: wl_keyboard;
    }
  | {
      id: Object_ID<wl_output_id>;
      object_type: wl_output;
    }
  | {
      id: Object_ID<wl_pointer_id>;
      object_type: wl_pointer;
    }
  | {
      id: Object_ID<wl_region_id>;
      object_type: wl_region;
    }
  | {
      id: Object_ID<wl_registry_id>;
      object_type: wl_registry;
    }
  | {
      id: Object_ID<wl_seat_id>;
      object_type: wl_seat;
    }
  | {
      id: Object_ID<wl_shm_id>;
      object_type: wl_shm;
    }
  | {
      id: Object_ID<wl_shm_pool_id>;
      object_type: wl_shm_pool;
    }
  | {
      id: Object_ID<wl_subcompositor_id>;
      object_type: wl_subcompositor;
    }
  | {
      id: Object_ID<wl_subsurface_id>;
      object_type: wl_subsurface;
    }
  | {
      id: Object_ID<wl_surface_id>;
      object_type: wl_surface;
    }
  | {
      id: Object_ID<xdg_popup_id>;
      object_type: xdg_popup;
    }
  | {
      id: Object_ID<xdg_positioner_id>;
      object_type: xdg_positioner;
    }
  | {
      id: Object_ID<xdg_surface_id>;
      object_type: xdg_surface;
    }
  | {
      id: Object_ID<xdg_toplevel_id>;
      object_type: xdg_toplevel;
    }
  | {
      id: Object_ID<xdg_wm_base_id>;
      object_type: xdg_wm_base;
    }
  | {
      id: Object_ID<xwayland_shell_v1_id>;
      object_type: xwayland_shell_v1;
    }
  | {
      id: Object_ID<zwp_xwayland_keyboard_grab_manager_v1_id>;
      object_type: zwp_xwayland_keyboard_grab_manager_v1;
    }
  | {
      id: Object_ID<zwp_xwayland_keyboard_grab_v1_id>;
      object_type: zwp_xwayland_keyboard_grab_v1;
    }
  | {
      id: Object_ID<xwayland_surface_v1_id>;
      object_type: xwayland_surface_v1;
    }
  | {
      id: Object_ID<wl_buffer_id>;
      object_type: wl_shm_pool;
    };
