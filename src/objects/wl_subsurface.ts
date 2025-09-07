import {
  wl_subsurface_delegate,
  wl_subsurface as w,
  wl_subsurface_error,
  wl_surface,
} from "../protocols/wayland.xml.ts";
import { Object_ID } from "../wayland_types.ts";
import { Wayland_Client } from "../Wayland_Client.ts";

export class wl_subsurface implements wl_subsurface_delegate {
  /**
   * wl_subsurface methods
   */

  wl_subsurface_destroy: wl_subsurface_delegate["wl_subsurface_destroy"] = (
    s,
    object_id
  ) => {
    /**
     * Delete the association between the role object and the surface
     */

    const surface_id = s.get_surface_id_from_role(object_id);

    s.unregister_role_to_surface(object_id);

    if (!surface_id) {
      return true;
    }
    const surface = s.get_object(surface_id)?.delegate;
    if (!surface) {
      return true;
    }

    if (
      !surface_id ||
      !surface ||
      !surface.has_role_data_of_type("sub_surface")
    ) {
      return true;
    }

    const parent_surface = s.get_object(this.parent)?.delegate;
    if (parent_surface) {
      const index_of_object_id =
        parent_surface.children_in_draw_order.indexOf(surface_id);
      if (index_of_object_id !== -1) {
        parent_surface.children_in_draw_order.splice(index_of_object_id, 1);
      }
    }
    surface.clear_role_data();
    return true;
  };
  wl_subsurface_set_position: wl_subsurface_delegate["wl_subsurface_set_position"] =
    (s, object_id, x, y) => {
      const surface_id = s.get_surface_id_from_role(object_id);

      if (surface_id === undefined) {
        s.send_error(
          object_id,
          wl_subsurface_error.bad_surface,
          "surface not found"
        );
        return;
      }

      const parent = s.get_object(this.parent)?.delegate;
      if (!parent) {
        s.send_error(
          object_id,
          wl_subsurface_error.bad_surface,
          "parent not found"
        );
        return;
      }
      parent.pending_update.set_child_position ??= [];

      parent.pending_update.set_child_position.push({
        child: surface_id,
        x,
        y,
      });
    };

  wl_subsurface_place_above: wl_subsurface_delegate["wl_subsurface_place_above"] =
    (s, object_id, sibling_or_parent_id) => {
      this.place_subsurface(s, object_id, sibling_or_parent_id, "above");
    };

  place_subsurface = (
    s: Wayland_Client,
    object_id: Object_ID<w>,
    sibling_or_parent_id: Object_ID<wl_surface>,
    above_or_below: "above" | "below"
  ) => {
    const surface_id = s.get_surface_id_from_role(object_id);

    if (surface_id === undefined) {
      s.send_error(
        object_id,
        wl_subsurface_error.bad_surface,
        "surface not found"
      );
      return;
    }

    const parent = s.get_object(this.parent)?.delegate;
    if (!parent) {
      s.send_error(
        object_id,
        wl_subsurface_error.bad_surface,
        "parent not found"
      );
      return;
    }
    const id =
      sibling_or_parent_id === this.parent ? null : sibling_or_parent_id;
    parent.pending_update.z_order_subsurfaces ??= [];

    parent.pending_update.z_order_subsurfaces.push({
      type: above_or_below,
      child_to_move: surface_id,
      relative_to: id,
    });
  };
  wl_subsurface_place_below: wl_subsurface_delegate["wl_subsurface_place_below"] =
    (s, object_id, sibling_or_parent_id) => {
      this.place_subsurface(s, object_id, sibling_or_parent_id, "below");
    };
  wl_subsurface_set_sync: wl_subsurface_delegate["wl_subsurface_set_sync"] = (
    s,
    object_id
  ) => {
    this.sync = true;
  };
  wl_subsurface_set_desync: wl_subsurface_delegate["wl_subsurface_set_desync"] =
    (s, object_id) => {
      this.sync = false;
    };
  wl_subsurface_on_bind: wl_subsurface_delegate["wl_subsurface_on_bind"] = (
    _s,
    _name,
    _interface_,
    _new_id,
    _version_number
  ) => {};

  sync: boolean = true;
  position: { x: number; y: number } = { x: 0, y: 0 };

  constructor(public parent: Object_ID<wl_surface>) {}
  static make(parent: wl_subsurface["parent"]): w {
    return new w(new wl_subsurface(parent));
  }
}
