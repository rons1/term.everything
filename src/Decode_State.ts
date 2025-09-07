import { never_default } from "./never_default.ts";
import { Object_ID } from "./wayland_types.ts";

export enum Decode_State_Type {
  ObjectID,
  Opcode,
  Size,
  Data,
}

export interface DecodeState_ObjectID {
  type: Decode_State_Type.ObjectID;
  i: number;
  object_id: Object_ID;
}
export interface DecodeState_Opcode extends Omit<DecodeState_ObjectID, "type"> {
  type: Decode_State_Type.Opcode;
  opcode: number;
}
export interface DecodeState_Size extends Omit<DecodeState_Opcode, "type"> {
  type: Decode_State_Type.Size;
  size: number;
}
export interface DecodeState_Data extends Omit<DecodeState_Size, "type"> {
  type: Decode_State_Type.Data;
  data: number[];
}

export const zero_size_data = (
  current_state: DecodeState_Size
): DecodeState_Data => {
  (current_state as any as DecodeState_Data).data = [];
  return current_state as any;
};

export const next_state = (current_state: Decode_State): Decode_State => {
  current_state.i = 0;
  switch (current_state.type) {
    case Decode_State_Type.ObjectID: {
      const new_state = current_state as any as DecodeState_Opcode;
      new_state.type = Decode_State_Type.Opcode;
      new_state.opcode = 0;
      return new_state;
    }
    case Decode_State_Type.Opcode: {
      const new_state = current_state as any as DecodeState_Size;
      new_state.type = Decode_State_Type.Size;
      new_state.size = 0;
      return new_state;
    }
    case Decode_State_Type.Size: {
      const new_state = current_state as any as DecodeState_Data;
      new_state.type = Decode_State_Type.Data;
      new_state.data = [];
      /** 8 is the size of the header and thus the minium size
       * if it is 8 there is no data to read
       * return to the object id state
       */
      if (new_state.size === 8) {
        return initial_state();
      }
      return new_state;
    }
    case Decode_State_Type.Data:
      return initial_state();
    default:
      never_default(current_state);
      return current_state;
  }
};

export const initial_state = (): Decode_State => ({
  type: Decode_State_Type.ObjectID,
  i: 0,
  object_id: 0 as Object_ID,
});

export type Decode_State =
  | DecodeState_ObjectID
  | DecodeState_Opcode
  | DecodeState_Size
  | DecodeState_Data;
