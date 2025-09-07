import {
  wl_shm_pool_delegate as d,
  wl_shm_pool as w,
  wl_buffer_delegate,
} from "../protocols/wayland.xml.ts";

import {
  wl_buffer_delegate as buffer_delegate,
  wl_buffer,
  wl_shm_format,
} from "../protocols/wayland.xml.ts";

import { Wayland_Client } from "../Wayland_Client.ts";
import c from "../c_interop.ts";
import { never_default } from "../never_default.ts";
import { File_Descriptor, Object_ID } from "../wayland_types.ts";

export enum Map_State {
  destroyed,
  mmapped,

  destroy_when_buffers_empty,
}

export interface BufferInfo {
  offset: number;
  width: number;
  height: number;
  stride: number;
  format: wl_shm_format;
}

export class wl_shm_pool implements d, buffer_delegate {
  map_state: Map_State;
  buffers = new Map<Object_ID<wl_buffer>, BufferInfo>();

  wl_shm_pool_create_buffer: d["wl_shm_pool_create_buffer"] = (
    s,
    _object_id,
    id,
    offset,
    width,
    height,
    stride,
    format
  ) => {
    const buf = new wl_buffer(this);
    s.add_object(id, buf);
    // const data = new Uint8ClampedArray(stride * height);
    // const texture = new ImageData(data, width, height);
    this.buffers.set(id, {
      offset,
      width,
      height,
      stride,
      format,
      // data,
      // texture,
    });
  };

  on_destroy_shm_pool = (s: Wayland_Client) => {
    c.unmmap_shm_pool(s.client_state, this.wl_shm_pool_object_id);
    this.map_state = Map_State.destroyed;
    s.remove_object(this.wl_shm_pool_object_id);
  };

  /**
   * This can be called by either on the buffer delegate or the pool delegate
   * @param s
   * @param _object_id Check This!! to see if it is the buffer id or the pool id
   * @returns false because wl_shm_pool hndles remove objet by itself
   */
  wl_shm_pool_destroy: d["wl_shm_pool_destroy"] = (s, _object_id) => {
    const buffers_empty = this.buffers.size <= 0;
    switch (this.map_state) {
      case Map_State.destroyed:
      case Map_State.destroy_when_buffers_empty:
        return false;
      case Map_State.mmapped:
        if (buffers_empty) {
          this.on_destroy_shm_pool(s);
          return false;
        }
        this.map_state = Map_State.destroy_when_buffers_empty;

        return false;
      default:
        never_default(this.map_state);
        return false;
    }
  };
  wl_shm_pool_resize: d["wl_shm_pool_resize"] = (s, _object_id, size) => {
    switch (this.map_state) {
      case Map_State.destroyed:
        return;
      case Map_State.mmapped:
      case Map_State.destroy_when_buffers_empty:
        const success = c.remap_shm_pool(
          s.client_state,
          this.wl_shm_pool_object_id,
          size
        );
        if (!success) {
          debugger;

          console.error("Failed to remap mmap for pool", _object_id);
          this.map_state = Map_State.destroyed;
          return;
        }

        return;
      default:
        never_default(this.map_state);
        return;
    }
  };
  /**
   * This can be called by either on the buffer delegate or the pool delegate
   * check the name and compare to object id
   * @param _s
   * @param _name
   * @param new_id
   * @param version
   */
  wl_shm_pool_on_bind: d["wl_shm_pool_on_bind"] = (
    _s,
    _name,
    _interface_,
    new_id,
    version
  ) => {
    console.log(
      `wl_shm_pool on_bind called with new_id: ${new_id}, version#: ${version}`
    );
  };

  constructor(
    client: Wayland_Client,
    public wl_shm_pool_object_id: Object_ID<w>,
    fd: File_Descriptor,
    size: number
  ) {
    if (typeof fd !== "number") {
      this.map_state = Map_State.destroyed;
      return;
    }
    // if(typeof fd !== "number"){
    //   console.log("fd", fd);
    //   debugger;
    //   throw new Error("fd is not a number");
    // }
    // if(typeof size !== "number"){
    //   throw new Error("size is not a number");
    // }
    // if(typeof wl_shm_pool_object_id !== "number"){
    //   console.log("wl_shm_pool_object_id", wl_shm_pool_object_id);
    //   throw new Error("wl_shm_pool_object_id is not a number");
    // }

    const success = c.mmap_shm_pool(
      client.client_state,
      fd,
      size,
      wl_shm_pool_object_id
    );
    if (success) {
      this.map_state = Map_State.mmapped;
      return;
    }
    console.error("Failed to mmap fd ", fd, "for pool", wl_shm_pool_object_id);
    this.map_state = Map_State.destroyed;
    return;
  }
  static make(
    client: Wayland_Client,
    object_id: Object_ID<w>,
    fd: File_Descriptor,
    size: number
  ): w {
    return new w(new wl_shm_pool(client, object_id, fd, size));
  }

  wl_buffer_on_bind: wl_buffer_delegate["wl_buffer_on_bind"] = (
    _s,
    _name,
    _interface_,
    _new_id,
    _version
  ) => {};

  wl_buffer_destroy: wl_buffer_delegate["wl_buffer_destroy"] = (
    s,
    buffer_object_id
  ) => {
    /**
     * If we are destroying a buffer
     */
    if (!this.buffers.has(buffer_object_id)) {
      console.error(
        "destroying a buffer that does not exist!, wl_shm_pool_id,  id buffer_id:",
        this.wl_shm_pool_object_id,
        buffer_object_id
      );
      return true;
    }
    this.buffers.delete(buffer_object_id);
    switch (this.map_state) {
      case Map_State.destroyed:
      case Map_State.mmapped:
        return true;
      case Map_State.destroy_when_buffers_empty:
        if (this.buffers.size > 0) {
          return true;
        }
        this.on_destroy_shm_pool(s);

        return true;
      default:
        never_default(this.map_state);
        return true;
    }
  };
}
