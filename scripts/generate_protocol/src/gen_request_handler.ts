import { debug_if_statement } from "./debug_if_statement.ts";
import { ArgType, Interface, never_default } from "./Protocol.ts";

export const arg_flatmap = (arg: ArgType, postfix: string) => {
  switch (arg.type) {
    case "new_id":
      if (arg.interface) {
        break;
      }
      return [
        arg.name + "_interface" + postfix,
        arg.name + "_version" + postfix,
        arg.name + "_id" + postfix,
      ];
    default:
      break;
  }
  return [arg.name + postfix];
};

export const gen_request_handler = (i: Interface) => {
  if (!i.request) {
    return "";
  }
  let out = "";
  for (const [index, req] of i.request.entries()) {
    const request_arguments = req.arg?.flatMap(({ $ }) =>
      arg_flatmap($, " as any")
    );

    const debug_request_arguments = (() => {
      const request_args_pure = req.arg?.flatMap(({ $ }) => arg_flatmap($, ""));
      if (!request_args_pure) {
        return "')'";
      }
      return (
        request_args_pure.map((a) => `"${a}: ", ${a}`).join(", ', ',") + ", ')'"
      );
    })();
    const is_auto_remove = req.$.name === "release" || req.$.name === "destroy";

    const debug_statement = debug_if_statement(i, req);
    out += `
    case ${index}:{

      ${
        req.arg
          ?.map((arg) => {
            return gen_arg_parse_code(arg.$);
          })
          .join("\n") ?? ""
      }

      if(${debug_statement}) {
        console.log(\`[\${debug_statement++}]: client#\${s.client_socket} ${i.$.name}@\${ message.object_id}.${req.$.name}(\`, ${debug_request_arguments}  );

      }
    

      ${is_auto_remove ? "const auto_remove = " : ""}this.delegate.${i.$.name}_${req.$.name}(s, message.object_id as any, ${request_arguments?.join(", ") ?? ""});
      
      ${
        req.$.name === "release"
          ? `
          if(auto_remove){
              s.remove_object(message.object_id as any);
              s.remove_global_bind(Global_Ids.${i.$.name}, message.object_id as any);
          }
          
     
        `
          : ""
      }
      ${
        req.$.name === "destroy"
          ? `
          if(auto_remove){
            s.remove_object(message.object_id as any)
          }`
          : ""
      }
      
      break;
    }

     
    `;
  }
  return out;
};

export const gen_arg_parse_code = (arg: ArgType) => {
  switch (arg.type) {
    case "fixed":
      return `const ${arg.name}_fixed = message.data[_data_in_offset__ + 0]! | message.data[_data_in_offset__ + 1]! << 8 
        | message.data[_data_in_offset__ + 2]!  << 16 
        | message.data[_data_in_offset__ + 3]!  << 24;
      const ${arg.name} = ${arg.name}_fixed / 256.0;
        
      _data_in_offset__ += 4;
        
      
      `;
    case "new_id":
      if (!arg.interface) {
        /**
         * Without an interface it first passes in
         * a string with the interface name,
         * a uint with the version
         * then the 32 bit object id
         */
        const string_code = gen_arg_parse_code({
          name: arg.name + "_interface",
          type: "string",
          summary: "",
        });
        const version_code = gen_arg_parse_code({
          name: arg.name + "_version",
          type: "uint",
          summary: "",
        });
        const id_code = gen_arg_parse_code({
          name: arg.name + "_id",
          type: "uint",
          summary: "",
        });
        return [string_code, version_code, id_code].join("\n");
      }

    /**
     * Fallthrough on purpose,
     * arg.interface without a name is just a new_id
     * a 32 bit number
     */
    case "uint":
    case "int":
      return `
      const ${arg.name} = message.data[_data_in_offset__ + 0]! | message.data[_data_in_offset__ + 1]! << 8 
        | message.data[_data_in_offset__ + 2]!  << 16 
        | message.data[_data_in_offset__ + 3]!  << 24;
        
      _data_in_offset__ += 4;
        `;
    case "object":
      const temp_argname = `__temp_${arg.name}`;
      return `
      const ${!arg["allow-null"] ? arg.name : temp_argname} = message.data[_data_in_offset__ + 0]! | message.data[_data_in_offset__ + 1]! << 8 
        | message.data[_data_in_offset__ + 2]!  << 16 
        | message.data[_data_in_offset__ + 3]!  << 24;
        
      _data_in_offset__ += 4;

      ${!arg["allow-null"] ? "" : `const ${arg.name} = ${temp_argname} === 0 ? null : ${temp_argname};`}
        `;

    case "string":
      /**
       * Minus 1 in the slice to the TExt decoder because the string is null terminated
       */
      return `
      const ${arg.name}_length = message.data[_data_in_offset__ + 0]! | message.data[_data_in_offset__ + 1]! << 8 
        | message.data[_data_in_offset__ + 2]!  << 16 
        | message.data[_data_in_offset__ + 3]!  << 24;
        
      _data_in_offset__ += 4;
      const ${arg.name} = new TextDecoder().decode(
          new Uint8Array(
            message.data.slice(
                _data_in_offset__,
                _data_in_offset__ + ${arg.name}_length - 1)));
      if (${arg.name}_length % 4 !== 0) {
        _data_in_offset__ += ${arg.name}_length + (4 - (${arg.name}_length % 4));
      } else {
        _data_in_offset__ += ${arg.name}_length;
      }
        `;
    case "array":
      return `
      const ${arg.name}_length = message.data[_data_in_offset__ + 0]! | message.data[_data_in_offset__ + 1]!! << 8
        | message.data[_data_in_offset__ + 2]!  << 16
        | message.data[_data_in_offset__ + 3]!  << 24;
      _data_in_offset__ += 4;
      const ${arg.name} = message.data.slice(_data_in_offset__, _data_in_offset__ + ${arg.name}_length);
      if (${arg.name}_length % 4 !== 0) {
        _data_in_offset__ += ${arg.name}_length + (4 - (${arg.name}_length % 4));
      } else {
        _data_in_offset__ += ${arg.name}_length;
      }
        `;
    case "fd":
      return `
      const ${arg.name} = s.claim_file_descriptor();
        `;
    default:
      never_default(arg);
      return "";
  }
};
