import { Interface, generate_typescript_type } from "./Protocol.ts";

export const gen_interface_interface = ({ request, $ }: Interface) => {
  if (!request) {
    return "";
  }

  let out = request
    .map((req) => {
      const the_args =
        req.arg
          ?.map((arg) => {
            return generate_typescript_type($.name, arg.$);
          })
          .join(", ") ?? "";

      const auto_release_return_type =
        req.$.name === "destroy" || req.$.name === "release";
      const return_type = auto_release_return_type ? "boolean" : "void";
      return `
      ${auto_release_return_type ? "/** @returns true if we should auto remove the object after destruction */" : ""}
      ${$.name}_${req.$.name}: (s: Wayland_Client, object_id: Object_ID<${$.name}>, ${the_args}) => ${return_type};
      `;
    })
    .join("\n");
  out += `
    
    ${$.name}_on_bind: (
    s: Wayland_Client,
    name: Object_ID<${$.name}>,
    interface_: string,
    new_id: Object_ID<${$.name}>,
    version_number: version
  ) => void;
  `;

  switch ($.name) {
    case "wl_keyboard":
      out += `
      after_get_keyboard: (s: Wayland_Client, object_id: Object_ID<${$.name}>) => void;
      `;
      break;
    case "wl_pointer":
      out += `
      after_get_pointer: (s: Wayland_Client, object_id: Object_ID<${$.name}>) => void;
      `;
      break;

    default:
      break;
  }

  return out;
};
