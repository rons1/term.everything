import { on_exit } from "./on_exit.ts";
import { Command_Line_args } from "./parse_args.ts";
import { spawn } from "child_process";

export const start_xwayland_if_necessary = async (
  wayland_display_name: string,
  args: Pick<
    Command_Line_args["values"],
    "support-old-apps" | "xwayland" | "shell" | "xwayland-wm"
  >
) => {
  if (!(args["support-old-apps"] || args["xwayland"])) {
    /**
     * No display name
     */
    return null;
  }
  if (Bun.which("Xwayland") === null) {
    console.error(`In order to support older apps, you need to install the Xwayland
 program. I can't find it in your $PATH. You can install it on ubuntu with

 sudo apt install xwayland matchbox # if you use the default options, you will need matchbox too

 If you are using a different distro, please check your package manager
 for the xwayland package.
 `);
    process.exit(1);
  }
  let display_name = ":5";
  if (args["xwayland"]) {
    const maybe_display_name = args["xwayland"].match(/(:\d+)/)?.[0];
    if (!maybe_display_name) {
      console.error(
        "Invalid xwayland options, I can't find a display name, like :3 or :6"
      );
      process.exit(1);
    }
    display_name = maybe_display_name;
  }
  const xwayland_options = args["xwayland"] ?? `${display_name} -retro`;

  const command = `Xwayland ${xwayland_options}`;

  const proc = spawn(args["shell"], ["-c", command], {
    env: {
      ...process.env,
      WAYLAND_DISPLAY: wayland_display_name,
    },
  });

  on_exit(() => {
    if (proc.killed) {
      return;
    }
    const pid = proc.pid;
    if (!pid) {
      proc.kill();
      return;
    }
    try {
      process.kill(proc.pid);
    } catch (e) {}
  });

  /**
   * allow it to start
   */
  await Bun.sleep(10);

  if (!args["xwayland-wm"]) {
    /**
     * Using the default options, so
     * that will be matchbox-window-manager
     */
    if (Bun.which("matchbox-window-manager") === null) {
      console.error(`In order to support older apps, you need to install the matchbox-window-manager
  program. I can't find it in your $PATH. You can install it on ubuntu with

  sudo apt install matchbox
        
  If you are using a different distro, please check your package manager
 for the matchbox package.`);
      process.exit(1);
    }
  }

  const window_manger =
    args["xwayland-wm"] ?? `matchbox-window-manager -display ${display_name}`;
  spawn(args["shell"], ["-c", window_manger]);

  /**
   * allow it to start
   */
  await Bun.sleep(10);

  return display_name;
};
