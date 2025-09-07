import {
  Decode_State,
  initial_state,
  DecodeState_Data,
  Decode_State_Type,
  next_state,
  zero_size_data,
} from "./Decode_State.ts";
import { never_default } from "./never_default.ts";

export class Message_Decoder {
  current_state: Decode_State = initial_state();

  consume = (buffer: Uint8Array, bytes_to_read: number) => {
    const new_messages: DecodeState_Data[] = [];

    for (let i = 0; i < bytes_to_read; i++) {
      switch (this.current_state.type) {
        case Decode_State_Type.ObjectID:
          //@ts-ignore
          this.current_state.object_id |= buffer[i] << this.current_state.i;
          this.current_state.i += 8;
          if (this.current_state.i === 32) {
            this.current_state = next_state(this.current_state);
          }
          break;
        case Decode_State_Type.Opcode:
          this.current_state.opcode |= buffer[i]! << this.current_state.i;
          this.current_state.i += 8;
          if (this.current_state.i === 16) {
            this.current_state = next_state(this.current_state);
          }
          break;
        case Decode_State_Type.Size:
          this.current_state.size |= buffer[i]! << this.current_state.i;
          this.current_state.i += 8;
          if (this.current_state.i === 16) {
            if (this.current_state.size === 8) {
              new_messages.push(zero_size_data(this.current_state));
            }
            this.current_state = next_state(this.current_state);
          }
          break;
        case Decode_State_Type.Data:
          this.current_state.data.push(buffer[i]!);
          /** need the minus 8 because the size includes the 8 byte header */
          if (this.current_state.data.length === this.current_state.size - 8) {
            new_messages.push(this.current_state);
            this.current_state = next_state(this.current_state);
          }
          break;
        default:
          never_default(this.current_state);
          break;
      }
    }
    return new_messages;
  };
}
