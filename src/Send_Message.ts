export interface Send_Message {
  object_id: number;
  opcode: number;
  data: Uint8Array;
  file_descriptor: number | undefined;
}

export interface Debug_Send_Message extends Send_Message {
  object_name: string;
  message_name: string;
  message_args: {
    signature: string;
    value: any;
  }[];
}

export const is_debug_send_message = (
  d: Send_Message
): d is Debug_Send_Message => {
  return (d as Debug_Send_Message).object_name !== undefined;
};
