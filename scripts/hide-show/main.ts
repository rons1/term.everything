import JSON5 from "json5";
import Bun from "bun";
const settings_file = process.env["SETTINGS-JSON"];
if (!settings_file) {
  console.error("SETTINGS-JSON not set");
  process.exit(1);
}

const json_file = await Bun.file(settings_file).text();
const settings = JSON5.parse(json_file);

const hidden_settings = [
  "third_party",
  "scripts",
  ".task",
  "deps",
  ".vscode",
  "bun.lock",
  "package.json",
  "**/Taskfile.dist.yml",
  "tsconfig.json",
  ".gitmodules",
  ".gitignore",
  "node_modules",
  "c_interop/build",
  "shaders/spirv",
  "bin",
  "pkg",
  "tests",
  "Appdir",
  "dist",
  "patches",
  "LICENSE.txt",
];

const exclude_files = "files.exclude";

settings[exclude_files] = settings[exclude_files] ?? {};

const new_value = process.env["HIDE"] === "true";

for (const setting of hidden_settings) {
  settings[exclude_files][setting] = new_value;
}
//Note we use JSON, not JSON5 for the output
const new_json = JSON.stringify(settings, null, 2);

await Bun.file(settings_file).write(new_json);
