//Note: AI wrote this code, so just deal with it.

import { readFile } from "node:fs/promises";
import Bun from "bun";
import { parse } from "@typescript-eslint/typescript-estree";
import { format } from "prettier";

const interfaceFilePath = process.env.INTERFACE_FILE_PATH;
if (!interfaceFilePath) {
  console.error("INTERFACE_FILE_PATH environment variable is not set.");
  process.exit(1);
}

const object_name = process.env.INTERFACE_NAME;
if (!object_name) {
  console.error("INTERFACE_NAME environment variable is not set.");
  process.exit(1);
}
const interfaceName = `${object_name}_delegate`;

const fileContent = await readFile(interfaceFilePath, "utf-8");
const sourceFile = parse(fileContent, { loc: true });

let interfaceDeclaration;
for (const statement of sourceFile.body) {
  if (
    statement.type === "ExportNamedDeclaration" &&
    statement.declaration?.type === "TSInterfaceDeclaration" &&
    statement.declaration.id.name === interfaceName
  ) {
    interfaceDeclaration = statement.declaration;
    break;
  }
}

if (!interfaceDeclaration) {
  console.error(
    `Interface ${interfaceName} not found in ${interfaceFilePath}.`
  );
  process.exit(1);
}
const is_global = process.env["GLOBAL"] == "1";
let classContent = `
import {${interfaceName} as d, ${object_name} as w} from "../protocols/wayland.xml.ts";
${is_global ? "" : `import { Wayland_Client } from "../Wayland_Client.ts"`}
import { Object_ID } from "../wayland_types.ts";

export class ${object_name} implements d {\n`;

for (const member of interfaceDeclaration.body.body) {
  if (member.type === "TSMethodSignature") {
    const methodName = member.key.name;
    const methodParams = member.params
      .map((param) =>
        param.typeAnnotation
          ? `${param.name}: ${param.typeAnnotation.typeAnnotation.type}`
          : param.name
      )
      .join(", ");
    classContent += `  ${methodName}(${methodParams}): d["${methodName}"] {\n    /** @TODO: Implement ${methodName} */ \n   \n  }\n`;
  } else if (member.type === "TSPropertySignature") {
    const propertyName = member.key.name;
    if (
      member.typeAnnotation.type === "TSTypeAnnotation" &&
      member.typeAnnotation.typeAnnotation.type === "TSFunctionType"
    ) {
      const methodParams = member.typeAnnotation.typeAnnotation.params
        .map((param) => param.name)
        .join(", ");
      classContent += `  ${propertyName}: d["${propertyName}"] = (${methodParams}) => {\n    /** @TODO: Implement ${propertyName} */ \n   };\n`;
    } else {
      classContent += `  ${propertyName};\n`;
    }
  }
}

// `${object_name}_on_bind : d["${object_name}_on_bind"] = (s,name, interface_, new_id, version) => {
//     console.log(\`${object_name} on_bind called with new_id: \${new_id}, version#: \${version}\`);
//     }

classContent += `${
  is_global
    ? ` static make( ): w {
    return new w(new ${object_name}());
  }`
    : ` constructor() {
    }
       static make(): w {
    return new w(new ${object_name}());
  }
    
    `
} 
   
    
   
    
    `;

classContent += `}\n`;

// const outputFilePath = `./${className}.ts`;
// await writeFile(outputFilePath, classContent);
const out = await format(classContent, { parser: "typescript" });
// console.log(out);
// console.log(`Class ${className} has been generated in ${outputFilePath}`);

const out_dir = process.env["OUT_DIR"] ?? "";
const file = Bun.file(`${out_dir}/${object_name}.ts`);
if ((await file.exists()) && process.env["FORCE"] !== "1") {
  console.error(
    "File already exists Not overwriting.run with FORCE=1 to overwrite"
  );
  process.exit(1);
}

await file.write(out);
