import { auto_release } from "../auto_release.ts";
import {
  xdg_positioner_delegate as d,
  xdg_positioner as w,
  xdg_positioner_anchor,
  xdg_positioner_gravity,
  xdg_positioner_constraint_adjustment,
} from "../protocols/wayland.xml.ts";
import { Size } from "../Size.ts";

export interface xdg_positioner_state {
  width: number;
  height: number;
  anchor_rect: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  anchor: xdg_positioner_anchor;
  gravity: xdg_positioner_gravity;
  constraint_adjustment: xdg_positioner_constraint_adjustment;
  offset: {
    x: number;
    y: number;
  };
  reactive: boolean;
  parent_size: Size;
  parent_configure: number;
}

export class xdg_positioner implements d {
  state: xdg_positioner_state = {
    width: 0,
    height: 0,
    anchor_rect: {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    },
    anchor: xdg_positioner_anchor.none,
    gravity: xdg_positioner_gravity.none,
    constraint_adjustment: xdg_positioner_constraint_adjustment.none,
    offset: {
      x: 0,
      y: 0,
    },
    reactive: false,
    parent_size: {
      width: 0,
      height: 0,
    },
    parent_configure: 0,
  };

  xdg_positioner_destroy: d["xdg_positioner_destroy"] = auto_release;
  xdg_positioner_set_size: d["xdg_positioner_set_size"] = (
    _s,
    _object_id,
    width,
    height
  ) => {
    this.state.width = width;
    this.state.height = height;
  };
  xdg_positioner_set_anchor_rect: d["xdg_positioner_set_anchor_rect"] = (
    _s,
    _object_id,
    x,
    y,
    width,
    height
  ) => {
    this.state.anchor_rect = { x, y, width, height };
  };
  xdg_positioner_set_anchor: d["xdg_positioner_set_anchor"] = (
    _s,
    _object_id,
    anchor
  ) => {
    this.state.anchor = anchor;
  };
  xdg_positioner_set_gravity: d["xdg_positioner_set_gravity"] = (
    _s,
    _object_id,
    gravity
  ) => {
    this.state.gravity = gravity;
  };
  xdg_positioner_set_constraint_adjustment: d["xdg_positioner_set_constraint_adjustment"] =
    (_s, _object_id, _constraint_adjustment) => {
      /** @TODO: Implement xdg_positioner_set_constraint_adjustment */
    };
  xdg_positioner_set_offset: d["xdg_positioner_set_offset"] = (
    _s,
    _object_id,
    x,
    y
  ) => {
    this.state.offset = { x, y };
  };
  xdg_positioner_set_reactive: d["xdg_positioner_set_reactive"] = (
    _s,
    _object_id
  ) => {
    this.state.reactive = true;
  };
  xdg_positioner_set_parent_size: d["xdg_positioner_set_parent_size"] = (
    _s,
    _object_id,
    parent_width,
    parent_height
  ) => {
    this.state.parent_size = { width: parent_width, height: parent_height };
  };
  xdg_positioner_set_parent_configure: d["xdg_positioner_set_parent_configure"] =
    (_s, _object_id, serial) => {
      this.state.parent_configure = serial;
    };
  xdg_positioner_on_bind: d["xdg_positioner_on_bind"] = (
    _s,
    _name,
    _interface_,
    _new_id,
    _version_number
  ) => {};

  constructor() {}
  static make(): w {
    return new w(new xdg_positioner());
  }
}
