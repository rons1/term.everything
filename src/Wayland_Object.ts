import { File_Descriptor_Claim } from "./File_Descriptor_Claim.ts";
import { DecodeState_Data } from "./Decode_State.ts";
import { Wayland_Client } from "./Wayland_Client.ts";

export interface Wayland_Object<T> {
  delegate: T;
  on_request: (
    s: File_Descriptor_Claim & Wayland_Client,
    message: DecodeState_Data
  ) => void;
}
