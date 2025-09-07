import { debug_if_statement } from "./debug_if_statement.ts";
import {
  generate_typescript_type,
  Interface,
  never_default,
  sanitized_arg_name,
} from "./Protocol.ts";

export const gen_events = (i: Interface): string => {
  if (!i.event) {
    return "";
  }
  let out = "";
  for (const [index, event] of i.event.entries()) {
    const args = (event.arg ?? [])
      .map((arg) => {
        return generate_typescript_type(i.$.name, arg.$, true);
      })
      .join(", ");
    const d = debug_if_statement(i, event);
    out += `

    static ${event.$.name} = (s: Sender, ${event.$.since !== undefined ? "bound_version: version," : ""}   event_object_id: Object_ID<${i.$.name}>, ${args} ) => {
        
        ${
          event.$.since == undefined
            ? ""
            : `if(bound_version < ${event.$.since}){
            if(${d}){
              console.error("Event ${event.$.name} is not available in version, skipping", bound_version);
            }
          return;
        }`
        }
        let data : number[] = [];
        let file_descriptor : undefined | File_Descriptor = undefined;
        ${
          event.arg
            ?.map((arg) => {
              const arg_name = sanitized_arg_name(arg.$);
              switch (arg.$.type) {
                case "fixed":
                  return `const ${arg_name}_fixed = ${arg_name} * 256.0;
                  data.push(${arg_name}_fixed & 0xff, (${arg_name}_fixed >> 8) & 0xff, (${arg_name}_fixed >> 16) & 0xff, (${arg_name}_fixed >> 24) & 0xff);
                  
                  `;
                case "int":
                case "uint":
                case "new_id":
                  return `data.push(${arg_name} & 0xff, (${arg_name} >> 8) & 0xff, (${arg_name} >> 16) & 0xff, (${arg_name} >> 24) & 0xff);`;
                case "object":
                  if (arg.$["allow-null"]) {
                    const temp_argname = `__temp_${arg_name}`;
                    return `const ${temp_argname} = ${arg_name} ?? 0;
                    data.push(${temp_argname} & 0xff, (${temp_argname} >> 8) & 0xff, (${temp_argname} >> 16) & 0xff, (${temp_argname} >> 24) & 0xff);`;
                  }
                  return `data.push(${arg_name} & 0xff, (${arg_name} >> 8) & 0xff, (${arg_name} >> 16) & 0xff, (${arg_name} >> 24) & 0xff);`;

                case "fd":
                  return `file_descriptor = ${arg_name};`;
                case "string":
                  return `
                    const ${arg_name}_utf8 = new TextEncoder().encode(${arg_name});
                    const ${arg_name}_total_length = ${arg_name}_utf8.length + 1;
                    data.push(${arg_name}_total_length& 0xff, (${arg_name}_total_length >> 8) & 0xff, (${arg_name}_total_length >> 16) & 0xff, (${arg_name}_total_length >> 24) & 0xff);
                    data.push(...${arg_name}_utf8);
                    data.push(0); /* Null terminator */
                    if(${arg_name}_total_length % 4 !== 0){
                       const padding = 4 - (${arg_name}_total_length % 4);
                        for (let i = 0; i < padding; i++) {
                          data.push(0);
                        }
                    }
                    `;
                case "array":
                  return `
                    data.push(${arg_name}.length & 0xff, (${arg_name}.length >> 8) & 0xff, (${arg_name}.length >> 16) & 0xff, (${arg_name}.length >> 24) & 0xff);
                    data.push(...${arg_name});
                    if(${arg_name}.length % 4 !== 0){
                        const padding = 4 - (${arg_name}.length % 4);
                        for (let i = 0; i < padding; i++) {
                          data.push(0);
                        }
                    }
                    `;
                default:
                  never_default(arg.$);
                  return "";
              }
            })
            .join("\n") ?? ""
        }
        const object = {
          object_id: event_object_id,
          opcode: ${index},
          data: new Uint8Array(data),
          file_descriptor,
        };
         if(${d}){
          const d = object as any as Debug_Send_Message;
          d.object_name = "${i.$.name}";
          d.message_name = "${event.$.name}";
          d.message_args = [
            
            ${
              event.arg
                ?.map((arg) => {
                  return `{ "signature": "${generate_typescript_type(i.$.name, arg.$, true)}", "value": ${sanitized_arg_name(arg.$)} }`;
                })
                .join(", ") ?? []
            }
          ];
         }
        s.send(object);
      
      
    }
    `;
  }
  return out;
};
