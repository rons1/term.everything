import Bun from "bun";

import { basename } from "node:path";

export const get_file = () => {
  const file = [
    ".h",
    ".hpp",
    ".c",
    ".cpp",
    ".cc",
    ".cxx",
    ".hxx",
    ".h++",
    ".H",
    ".hh",
  ].reduce((name, ext) => basename(name, ext), process.argv[2]);

  const include_file_path = `./include/${file}.h`;

  const src_file_path = `./src/${file}.cpp`;
  const include_file = Bun.file(include_file_path);
  const src_file = Bun.file(src_file_path);

  const js_func_paths = (() => {
    const is_a_js_func = process.env.JS_FUNC ? true : false;
    if (!is_a_js_func) {
      return {};
    }
    const node_api_file_path = `./src/NODE_API_MODULE.cpp`;
    const node_api_file = Bun.file(node_api_file_path);

    return {
      node_api_file,
      node_api_file_path,
    };
  })();

  return {
    file,
    include_file_path,
    src_file_path,
    include_file,
    src_file,
    ...js_func_paths,
    meson_build_file: Bun.file("./meson.build"),
  };
};
