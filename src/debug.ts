/**
 * This is a macro that returns true if the DEBUG environment variable is set to "true"
 * and false otherwise. Use like this:
 *
 * ```typescript
 * import { debug_time_only } from "./debug.ts" with {type: "macro"};
 * if (wayland_debug_time_only()) {
 *  console.log("debugging");
 * }
 * ```
 * Then, during the build process, the bundler
 * will use dead code elimination to both the
 * check and everything inside the block.
 *
 */

export const wayland_debug_time_only = () => {
  return process.env["WAYLAND_DEBUG"] !== undefined;
};

/**
 * These requests/events tend to be very verbose, so we
 * only want let's hide them
 */
export const show_wayland_surface_and_buffer = () => {
  return (
    process.env["WAYLAND_DEBUG_HIDE_SURFACE_AND_BUFFER_MESSAGES"] === undefined
  );
};
