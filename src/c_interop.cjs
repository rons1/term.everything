import { c_interop_node_path } from "./c_interop_node_path.ts" with { type: "macro" };
const { constants } = require("node:os");

/**
 * Have to use dlopen instead of require, so
 * that bun won't try to include the native module
 * in the executable. This way we can grab the
 * correct .so file from the app image
 */
process.dlopen(module, c_interop_node_path(), constants.dlopen.RTLD_NOW);
