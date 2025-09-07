import { parseStringPromise } from "xml2js";
import Bun from "bun";
import { Protocol } from "./Protocol.ts";
import prettier from "prettier";
import { gen_interface_interface } from "./gen_interface_interface.ts";
import { gen_enums } from "./gen_enums.ts";
import { gen_events } from "./gen_events.ts";
import { gen_request_handler } from "./gen_request_handler.ts";

export const build_protocol = async (file_name: string) => {
  const bob: Protocol = await parseStringPromise(
    await Bun.file(`${import.meta.dir}/../protocols/${file_name}`).text()
  );

  let out = ``;

  for (const int of bob.protocol.interface) {
    const delegate_name = `${int.$.name}_delegate`;
    let bob = `
  export interface ${delegate_name} {
    ${gen_interface_interface(int)}
  }
  
    export class ${int.$.name} {

      constructor(public delegate: ${delegate_name}) {}
      ${gen_events(int)}

    on_request = (
    //@ts-ignore
    s: FileDescriptorClaim & Wayland_Client, 
    message: DecodeState_Data) => {
    //@ts-ignore
      let _data_in_offset__ = 0;
      switch(message.opcode){
      ${gen_request_handler(int)}
        default:
          console.error("Unknown opcode on ${int.$.name}", message.opcode);
          break;
      }

    }
    
  }
    ${gen_enums(int)}

`;
    out += bob;
  }

  const out_file = await prettier.format(out, { parser: "typescript" });
  // const out_file = out;

  return out_file;

  //   Bun.write(`${process.env["OUT_DIR"]}/${file_name}.ts`, out_file);
};
