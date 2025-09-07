import { enum_name } from "./enum_name.ts";
import { Interface } from "./Protocol.ts";

export const gen_enums = (int_face: Interface) => {
  if (!int_face.enum) {
    return "";
  }

  let out = "";
  for (const en of int_face.enum) {
    const new_enum_name = enum_name(int_face.$.name, en.$.name);

    let bob = `export enum ${new_enum_name} {
    ${en.entry.map((e) => `${e.$.name.replace(/^(\d)/,"_$1")} = ${e.$.value}`).join(",\n")}

  }
    `;
    out += bob;
  }
  return out;
};
