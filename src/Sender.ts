import { Send_Message } from "./Send_Message.ts";


export interface Sender {
  send(data: Send_Message): void;
}
