import Bun from "bun";
import { get_file } from "./get_file.ts";
if (process.argv.length < 3) {
  console.error("Usage: [JS_FUNC=1] bun make_source.ts <file>");
  console.error("Example: bun make_source.ts $file");
  console.error("Makes ./include/$file.h");
  console.error("Makes ./src/$file.cpp");
  console.error("And adds the file to meson.build");
  process.exit(1);
}

const {
  include_file,
  include_file_path,
  meson_build_file,
  src_file_path,
  src_file,
  file,
  node_api_file,
} = get_file();

if (!(await include_file.exists())) {
  const include_file_content = `#pragma once
${
  node_api_file
    ? `
  #include <napi.h>
using namespace Napi;
Value ${file}_js(const CallbackInfo &info);
  `
    : ""
}
`;
  await Bun.write(include_file_path, include_file_content);
}
if (!(await src_file.exists())) {
  const src_file_content = `#include "${file}.h"

${
  node_api_file
    ? `
  Value ${file}_js(const CallbackInfo &info){
    auto env = info.Env();
    /**
     * @TODO implement this
     */
    return env.Undefined();
  }
  `
    : ""
}
`;
  await Bun.write(src_file_path, src_file_content);
}

if (!(await meson_build_file.exists())) {
  console.error(`meson.build File does not exist`);
  process.exit(1);
}

const insert_line = (
  lines: string[],
  key_word: string,
  comment_characters: string,
  line_to_insert: string
) => {
  const regex = new RegExp(
    `(^\\s*)${comment_characters}\\s*{\\s*${key_word}\\s*\\}`
  );
  return lines.flatMap((line) => {
    const result = line.match(regex);
    if (!result) {
      return [line];
    }
    const [_, indent] = result;
    return [`${indent}${line_to_insert}`, line];
  });
};

const meson_build_content = await meson_build_file.text();

const meson_build_lines = meson_build_content.split("\n");

const item_to_insert = `'src/${file}.cpp',`;
if (!meson_build_lines.includes(item_to_insert)) {
  const meson_build_lines_new = insert_line(
    meson_build_lines,
    'new_file',
    "#",
    `'src/${file}.cpp',`
  ).join("\n");

  // const meson_build_lines_new = meson_build_lines
  //   .flatMap((line) => {
  //     const result = line.match(regex);
  //     if (!result) {
  //       return [line];
  //     }
  //     const [_, indent] = result;
  //     return [`${indent}'src/${file}.cpp',`, line];
  //   })
  //   .join("\n");
  await Bun.write("./meson.build", meson_build_lines_new);
}

if (!node_api_file) {
  process.exit(0);
}

const js_item_to_insert = `#include "${file}.h"`;

const node_api_file_content = await node_api_file.text();
if (!node_api_file_content.includes(js_item_to_insert)) {
  const node_api_file_lines = node_api_file_content.split("\n");

  const _a = insert_line(
    node_api_file_lines,
    "NEW_INCLUDE",
    "//",
    js_item_to_insert
  );
  const out_node_api_module = insert_line(
    _a,
    "NEW_FUNC",
    "//",
    `exports["${file}"] = Function::New(env, ${file}_js);`
  ).join("\n");

  await node_api_file.write(out_node_api_module);
}
