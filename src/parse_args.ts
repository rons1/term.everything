import Bun from "bun";
import { parseArgs } from "util";
//@ts-ignore
import help_file from "../resources/help.md" with { type: "file" };
import { render_markdown_to_terminal } from "./render_markdown_to_terminal.ts";

export type Command_Line_args =
  ReturnType<typeof parse_args> extends Promise<infer T> ? T : never;

export const parse_args = async () => {
  const args = parseArgs({
    options: {
      ["wayland-display-name"]: {
        type: "string",
      },
      "support-old-apps": {
        type: "boolean",
      },
      xwayland: {
        type: "string",
      },
      ["xwayland-wm"]: {
        type: "string",
      },
      shell: {
        type: "string",
        default: "/bin/bash",
      },
      ["hide-status-bar"]: {
        type: "boolean",
        default: false,
      },
      "virtual-monitor-size": {
        type: "string",
      },

      version: {
        type: "boolean",
      },
      help: {
        type: "boolean",
        short: "h",
      },
    },
    args: Bun.argv.slice(2),
    allowPositionals: true,
  });
  if (args.values.version) {
    console.log("1.0.0");
    process.exit(0);
  }
  if (args.values.help) {
    const help_markdown = await Bun.file(help_file).text();
    render_markdown_to_terminal(help_markdown);
    process.exit(0);
  }
  return args;
};
