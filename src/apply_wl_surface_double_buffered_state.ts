import { wl_surface } from "./protocols/wayland.xml.ts";
import { Object_ID } from "./wayland_types.ts";
import { Wayland_Client } from "./Wayland_Client.ts";
import { Pending_Buffer_Updates } from "./objects/wl_surface.ts";

export const apply_wl_surface_double_buffered_state = (
  s: Wayland_Client,
  surface_object_id: Object_ID<wl_surface>,
  sync_set_by_parent: boolean,
  accumulator: Pending_Buffer_Updates[],
  z_index: number
) => {
  /**
   * Could be a child surface
   */
  const surface = s.get_object(surface_object_id)?.delegate;
  if (!surface) {
    return;
  }

  const update = surface.pending_update;
  if (update.buffer !== undefined) {
    accumulator.push({
      buffer: update.buffer,
      surface: surface_object_id,
      z_index,
    });
  }
  if (update.buffer_scale !== undefined) {
    surface.buffer_scale = update.buffer_scale;
  }
  if (update.buffer_transform !== undefined) {
    surface.buffer_transform = update.buffer_transform;
  }
  if (update.damage !== undefined || update.damage_buffer !== undefined) {
    surface.damaged = true;
  } else {
    surface.damaged = false;
  }

  if (update.offset !== undefined) {
    /**
     * @TODO Docs say:
     * The x and y arguments specify the location of the new pending
     * buffer's upper left corner,
     * relative to the current buffer's upper left corner,
     * in surface-local coordinates.
     * In other words, the x and y,
     * combined with the new surface size define in
     * which directions the surface's size changes.
     *
     * So I think this means I should add the offset to the current offset
     * of the surface, not just set it to the offset.
     */
    surface.offset.x += update.offset.x;
    surface.offset.y += update.offset.y;
    /**
     * From the docs:
     * On wl_surface.offset requests to the pointer surface, hotspot_x and hotspot_y are decremented by the x and y parameters passed to the request. The offset must be applied by wl_surface.commit as usual.
     */
    // if (surface.role?.type === "cursor" && surface.role.data) {
    //   surface.role.data.hotspot.x -= update.offset.x;
    //   surface.role.data.hotspot.y -= update.offset.y;
    // }
  }
  if (update.input_region !== undefined) {
    if (
      surface.input_region !== null &&
      surface.input_region !== update.input_region
    ) {
      /**
       * According to the docs, the input region has copy
       * semantics and the old region can be destroyed
       * immediately after setting the new region.
       */
      s.remove_object(surface.input_region);
    }
    surface.input_region = update.input_region;
  }
  if (update.opaque_region !== undefined) {
    if (
      surface.opaque_region !== null &&
      surface.opaque_region !== update.opaque_region
    ) {
      /**
       * According to the docs, the opaque region has copy
       * semantics and the old region can be destroyed
       * immediately after setting the new region.
       */
      s.remove_object(surface.opaque_region);
    }
    surface.opaque_region = update.opaque_region;
  }

  if (update.add_sub_surface !== undefined) {
    for (const sub_surface_id of update.add_sub_surface!) {
      surface.children_in_draw_order.unshift(sub_surface_id);
    }
  }

  if (update.set_child_position !== undefined) {
    for (const child_position of update.set_child_position) {
      const index_of_child = surface.children_in_draw_order.indexOf(
        child_position.child
      );
      if (index_of_child === -1) {
        continue;
      }
      const child_surface = s.get_object(child_position.child)?.delegate;
      if (!child_surface) {
        continue;
      }
      if (!child_surface.has_role_data_of_type("sub_surface")) {
        continue;
      }
      const sub_surface = s.get_object(child_surface.role.data)?.delegate;
      if (!sub_surface) {
        continue;
      }

      sub_surface.position = {
        x: child_position.x,
        y: child_position.y,
      };
    }
  }

  if (update.z_order_subsurfaces !== undefined) {
    for (const z_oder_update of update.z_order_subsurfaces) {
      const index_of_child = surface.children_in_draw_order.indexOf(
        z_oder_update.child_to_move
      );
      if (index_of_child === -1) {
        continue;
      }
      const index_of_relative_to = surface.children_in_draw_order.indexOf(
        z_oder_update.relative_to
      );
      if (index_of_relative_to === -1) {
        continue;
      }
      /**
       * Remove the child from the list
       * then reinsert it at the correct index
       * either above or below the relative_to child
       * Since it is drawn in order, above means it will
       * be added to the array after the relative_to child
       * and below means it will be added before the relative_to child
       */
      surface.children_in_draw_order.splice(index_of_child, 1);
      const offset = z_oder_update.type === "above" ? 1 : 0;
      surface.children_in_draw_order.splice(
        index_of_relative_to + offset,
        0,
        z_oder_update.child_to_move
      );
    }
  }

  if (update.xdg_surface_window_geometry) {
    const xdg_surface_state_id = surface.xdg_surface_state;
    if (xdg_surface_state_id) {
      const xdg_surface_state = s.get_object(xdg_surface_state_id)?.delegate;
      if (xdg_surface_state) {
        xdg_surface_state.window_geometry = update.xdg_surface_window_geometry;
      }
      // xdg_surface_state.window_geometry = update.xdg_surface_window_geometry;
    }
  }

  if (surface.role?.type === "xdg_toplevel") {
    if (surface.role.data !== null) {
      const top_level = s.get_object(surface.role.data)?.delegate;
      if (top_level && top_level.pending_state) {
        if (top_level.pending_state.max_size) {
          top_level.max_size = top_level.pending_state.max_size;
        }
        if (top_level.min_size) {
          top_level.min_size = top_level.min_size;
        }
        delete top_level.pending_state;
      }
    }
  }

  // if (
  //   surface.has_role_data_of_type("xdg_toplevel") &&
  //   surface.role.data.pending_state
  // ) {
  //   if (surface.role.data.pending_state.max_size) {
  //     surface.role.data.max_size = surface.role.data.pending_state.max_size;
  //   }
  //   if (surface.role.data.pending_state.min_size) {
  //     surface.role.data.min_size = surface.role.data.pending_state.min_size;
  //   }
  //   delete surface.role.data.pending_state;
  // }
  if (surface.pending_update.xwayland_surfarface_v1_serial) {
    if (surface.role?.type === "xwayland_surface_v1") {
      surface.role.data ??= {
        serial: null,
      };
      surface.role.data.serial =
        surface.pending_update.xwayland_surfarface_v1_serial;
    }
  }

  surface.pending_update = {};

  /**
   * Apply updates to children
   */
  for (const child_surface_object_id of surface.children_in_draw_order) {
    if (child_surface_object_id === null) {
      continue;
    }
    if (sync_set_by_parent) {
      apply_wl_surface_double_buffered_state(
        s,
        child_surface_object_id,
        sync_set_by_parent,
        accumulator,
        z_index + 1
      );
      continue;
    }
    const child_surface = s.get_object(child_surface_object_id)?.delegate;

    if (!child_surface) {
      continue;
    }
    if (!child_surface.has_role_data_of_type("sub_surface")) {
      continue;
    }
    const sub_surface = s.get_object(child_surface.role.data)?.delegate;
    if (!sub_surface) {
      continue;
    }
    // if (
    //   child_surface.role.type !== "sub_surface" ||
    //   child_surface.role.data === null
    // ) {
    //   continue;
    // }
    // if (!child_surface.role.data.sync) {
    if (!sub_surface.sync) {
      /**
       * The child is not set to sync with the parent
       * so do not apply state changes now
       */
      continue;
    }
    apply_wl_surface_double_buffered_state(
      s,
      child_surface_object_id,
      true,
      accumulator,
      z_index + 1
    );
  }
};
