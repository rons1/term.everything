import { auto_release } from "../auto_release.ts";
import {
  wl_shm_delegate as d,
  wl_shm as w,
  wl_shm_format,
} from "../protocols/wayland.xml.ts";
import { wl_shm_pool } from "./wl_shm_pool.ts";

export class wl_shm implements d {
  wl_shm_create_pool: d["wl_shm_create_pool"] = (
    s,
    _object_id,
    id,
    fd,
    size
  ) => {
    s.add_object(id, wl_shm_pool.make(s, id, fd!, size));
  };
  /**
   * Here's what this does according to the docs:
   * Using this request a client can tell the server that it is not going to use the shm object anymore.
   *   Objects created via this interface remain unaffected.
   *
   * So I guess remove the object from the client, but leave all pools alone?
   * @param s
   * @param _object_id
   */
  wl_shm_release: d["wl_shm_release"] = auto_release;
  wl_shm_on_bind: d["wl_shm_on_bind"] = (s, _name, _interface_, new_id) => {
    w.format(s, new_id, wl_shm_format.argb8888);
  };
  static make(): w {
    return new w(new wl_shm());
  }
}
