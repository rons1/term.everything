import { enum_name } from "./enum_name.ts";

export interface Protocol {
  protocol: {
    $: {
      name: string;
    };
    interface: Interface[];
  };
  copyright: any;
}

export interface Interface {
  $: {
    name: string;
    version: string;
  };
  description: any;
  request?: EventOrRequest[];
  event?: EventOrRequest[];
  enum?: Enum[];
}

export interface Enum {
  $: {
    name: string;
  };
  entry: Entry[];
}

export interface Entry {
  $: {
    name: string;
    value: string;
    summary: string;
  };
}

export interface EventOrRequest {
  $: {
    name: string;
    since?: string;
  };
  arg?: Arg[];
  description: {
    $: {
      summary: string;
    };
  };
}

export interface Arg {
  $: ArgType;
}

export interface CommonArg {
  summary: string;
  name: string;
}

export interface Arg_NewId extends CommonArg {
  type: "new_id";
  interface?: string;
}

export interface ArgObject extends CommonArg {
  type: "object";
  interface?: string;
  ["allow-null"]?: string;
}

export interface ArgUint extends CommonArg {
  type: "uint";
  enum?: string;
}

export interface ArgString extends CommonArg {
  type: "string";
  allow_null?: string;
}
export interface ArgInt extends CommonArg {
  type: "int";
}

export interface ArgFd extends CommonArg {
  type: "fd";
}

export interface ArgFixed extends CommonArg {
  type: "fixed";
}
export interface ArgArray extends CommonArg {
  type: "array";
}

export type ArgType =
  | Arg_NewId
  | ArgObject
  | ArgUint
  | ArgString
  | ArgInt
  | ArgFd
  | ArgFixed
  | ArgArray;

export const sanitized_arg_name = (arg: ArgType) => {
  switch (arg.name) {
    case "interface":
      return "interface_";
    case "class":
      return "class_";
    default:
      return arg.name;
  }
};

export const generate_typescript_type = (
  interface_name: string,
  arg: ArgType,
  event: boolean = false
) => {
  const name = sanitized_arg_name(arg);

  switch (arg.type) {
    case "new_id":
      if (arg.interface) {
        return `${name}: Object_ID<${arg.interface}>`;
      }
      return `${name}_interface: string, ${name}_version: UInt32, ${name}_id: Object_ID`;
    case "object":
      return `${name}: Object_ID${arg.interface ? `<${arg.interface}>` : ""}  ${arg["allow-null"] ? "| null" : ""} `;
    case "uint":
      if (!arg.enum) {
        return `${name}: UInt32`;
      }
      return `${name}: ${enum_name(interface_name, arg.enum)}`;
    case "string":
      return `${name}: string`;
    case "int":
      return `${name}: Int32`;
    case "fd":
      if (event) {
        return `${name}: Exclude<File_Descriptor,null>`;
      }
      return `${name}: File_Descriptor`;
    case "fixed":
      return `${name}: Fixed`;
    case "array":
      return `${name}: number[]`;
    default:
      never_default(arg);
      return "";
  }
};
export const never_default = (arg: never) => {
  debugger;
  console.log(arg);
  throw new Error("this should never happen");
};
