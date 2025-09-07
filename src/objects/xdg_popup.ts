import {
  xdg_popup_delegate,
  xdg_popup as w,
  xdg_surface,
} from "../protocols/wayland.xml.ts";
import { Object_ID, version } from "../wayland_types.ts";
import { xdg_positioner_state } from "./xdg_positioner.ts";
// import { configure } from "./xdg_surface.ts";
import { virtual_monitor_size } from "../virtual_monitor_size.ts";

export class xdg_popup implements xdg_popup_delegate {
  /**
   * Only one instead of a queue because if multiple
   * position requests are sent we can ignore
   * all but the last one
   */
  pending_position: xdg_positioner_state | null = null;
  pending_position_serial: number | null = null;

  xdg_popup_destroy: xdg_popup_delegate["xdg_popup_destroy"] = (
    s,
    object_id
  ) => {
    const surface = s.get_surface_from_role(object_id);

    s.unregister_role_to_surface(object_id);
    if (!surface || !surface.has_role_data_of_type("xdg_popup")) {
      return true;
    }
    surface.clear_role_data();
    return true;
  };
  xdg_popup_grab: xdg_popup_delegate["xdg_popup_grab"] = (
    _s,
    _object_id,
    _seat,
    _serial
  ) => {
    /** @TODO: Implement xdg_popup_grab */
  };
  xdg_popup_reposition: xdg_popup_delegate["xdg_popup_reposition"] = (
    s,
    object_id,
    positioner_id,
    token
  ) => {
    const positioner = s.get_object(positioner_id)?.delegate;

    if (!positioner) {
      return;
    }
    this.pending_position = JSON.parse(JSON.stringify(positioner.state));
    this.pending_position_serial = token;

    w.repositioned(s, this.version, object_id, token);
    /**
     * @TODO figure out what
     * these values are
     */
    w.configure(
      s,
      object_id,
      0,
      0,
      virtual_monitor_size.width,
      virtual_monitor_size.height
    );
    const surface = s.get_surface_from_role(object_id);
    if (!surface) {
      return;
    }
    if (!surface.xdg_surface_state) {
      return;
    }
    const xdg_surface_state = s.get_object(surface.xdg_surface_state)?.delegate;
    if (!xdg_surface_state) {
      return;
    }
    xdg_surface_state.configure(s).then(() => {
      /**
       * @TODO reposition the popup somehow
       */
    });

    // configure(s, surface.xdg_surface_state).then(() => {
    //   /**
    //    * @TODO reposition the popup somehow
    //    */
    // });
  };
  xdg_popup_on_bind: xdg_popup_delegate["xdg_popup_on_bind"] = (
    _s,
    _name,
    _interface_,
    _new_id,
    _version_number
  ) => {};
  constructor(
    public version: version,
    public parent: Object_ID<xdg_surface> | null,
    public state: xdg_positioner_state
  ) {}
  static make(
    version: version,
    parent: xdg_popup["parent"],
    state: xdg_popup["state"]
  ): w {
    return new w(new xdg_popup(version, parent, state));
  }
}
