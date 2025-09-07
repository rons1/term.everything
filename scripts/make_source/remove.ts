import Bun, { $ } from "bun";
import { get_file } from "./get_file.ts";

if (process.argv.length < 3) {
  console.error("Usage: [JS_FUNC=1] bun remove.ts <file>");
  console.error("Example: bun remove.ts $file[.h|.cpp optional]");
  console.error("Removes ./include/$file.h");
  console.error("Removes ./src/$file.cpp");
  console.error("And removes the file from meson.build");
  process.exit(1);
}

const {
  include_file,
  meson_build_file,
  include_file_path,
  src_file_path,
  src_file,
  file,
  node_api_file,
} = get_file();

if (!process.env.FORCE) {
  /**
   * If you don't have git installed, then it will report as a failure,
   * which is fine.
   */
  const status =
    await $`git status --porcelain ${include_file_path} ${src_file_path}`.text();

  if (status !== "") {
    console.log("status is");
    console.log(status);
    console.error(
      `Files ${include_file_path} and ${src_file_path} are not clean, will not remove. Use FORCE=1 to override.`
    );
    process.exit(1);
  }
}
include_file.unlink().catch(() => {});
src_file.unlink().catch(() => {});
if (!(await meson_build_file.exists())) {
  /**
   * IF it doesn't exist, we don't need to remove it
   */
  process.exit(0);
}
const meson_build_content = await meson_build_file.text();
const meson_build_lines = meson_build_content.split("\n");
const new_content = meson_build_lines
  .filter((line) => !line.includes(`'src/${file}.cpp'`))
  .join("\n");
await Bun.write("./meson.build", new_content);

if (!node_api_file) {
  process.exit(0);
}
const node_api_content = await node_api_file.text();
const node_api_lines = node_api_content.split("\n");
const new_node_api_content = node_api_lines
  .filter(
    (line) => !(line.includes(`"${file}"`) || line.includes(`"${file}.h"`))
  )
  .join("\n");
await node_api_file.write(new_node_api_content);
