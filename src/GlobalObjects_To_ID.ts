import { Global_Ids } from "./GlobalObjects.ts";
import {
  wl_compositor,
  wl_data_device_manager,
  wl_display,
  wl_keyboard,
  wl_output,
  wl_pointer,
  wl_seat,
  wl_shm,
  wl_subcompositor,
  wl_touch,
  xdg_wm_base,
  xwayland_shell_v1,
  zwp_xwayland_keyboard_grab_manager_v1,
  zxdg_decoration_manager_v1,
} from "./protocols/wayland.xml.ts";
import { Object_ID } from "./wayland_types.ts";

export type Global_ID_To_Object_ID<T extends Global_Ids> = Object_ID<
  Global_ID_To_Object_Type<T>
>;

export const safe_cast_global_id_to_object_id = <T extends Global_Ids>(
  global_id: T
): Global_ID_To_Object_ID<T> => {
  return global_id as Global_ID_To_Object_ID<T>;
};

export type Global_ID_To_Object_Type<T extends Global_Ids> = Extract<
  GlobalObjects_To_Object_Type_Union,
  { id: T }
>["object_type"];

export type GlobalObjects_To_Object_Type_Union =
  | {
      id: Global_Ids.wl_display;
      object_type: wl_display;
    }
  | {
      id: Global_Ids.wl_compositor;
      object_type: wl_compositor;
    }
  | {
      id: Global_Ids.wl_subcompositor;
      object_type: wl_subcompositor;
    }
  | {
      id: Global_Ids.wl_output;
      object_type: wl_output;
    }
  | {
      id: Global_Ids.wl_seat;
      object_type: wl_seat;
    }
  | {
      id: Global_Ids.wl_shm;
      object_type: wl_shm;
    }
  | {
      id: Global_Ids.wl_keyboard;
      object_type: wl_keyboard;
    }
  | {
      id: Global_Ids.wl_pointer;
      object_type: wl_pointer;
    }
  | {
      id: Global_Ids.xdg_wm_base;
      object_type: xdg_wm_base;
    }
  | {
      id: Global_Ids.wl_data_device_manager;
      object_type: wl_data_device_manager;
    }
  | {
      id: Global_Ids.zwp_xwayland_keyboard_grab_manager_v1;
      object_type: zwp_xwayland_keyboard_grab_manager_v1;
    }
  | {
      id: Global_Ids.xwayland_shell_v1;
      object_type: xwayland_shell_v1;
    }
  | {
      id: Global_Ids.wl_data_device;
      object_type: wl_seat;
    }
  | {
      id: Global_Ids.wl_touch;
      object_type: wl_touch;
    }
  | {
      id: Global_Ids.zxdg_decoration_manager_v1;
      object_type: zxdg_decoration_manager_v1;
    };
