// import { socket_file_descriptor } from "./index.ts";
import { Wayland_Client } from "./Wayland_Client.ts";
import { listen_for_client } from "./c_promises.ts";
import { on_exit } from "./on_exit.ts";
import { statSync } from "node:fs";
import { Command_Line_args } from "./parse_args.ts";
import cpp from "./c_interop.ts";

export type Display_Name = Pick<
  Command_Line_args["values"],
  "wayland-display-name"
>;

export class Wayland_Socket_Listener {
  wayland_display_name: string;
  socket_file_descriptor: number;
  constructor(args: Display_Name) {
    this.wayland_display_name = get_wayland_display_name(args);

    const maybe_socket_file_descriptor = cpp.listen_to_wayland_socket(
      this.wayland_display_name
    );
    if (maybe_socket_file_descriptor == null) {
      console.error("Failed to listen to wayland socket");
      process.exit(1);
    }
    this.socket_file_descriptor = maybe_socket_file_descriptor;
    on_exit(this.on_exit);
    return;
  }
  clients: Set<Wayland_Client> = new Set();

  on_exit = () => {
    cpp.close_wayland_socket(
      this.wayland_display_name,
      this.socket_file_descriptor
    );
  };

  main_loop = async () => {
    while (true) {
      const { client_socket, client_state } = await listen_for_client(
        this.socket_file_descriptor
      );
      if (client_socket == -1) {
        console.error("Failed to listen for client");
        return;
      }
      const new_client = new Wayland_Client(client_socket, client_state);
      this.clients.add(new_client);
      new_client.main_loop().then(() => {
        this.clients.delete(new_client);
      });
    }
  };
}

const get_wayland_display_name = (args: Display_Name) => {
  const name =
    args["wayland-display-name"] ?? process.env["WAYLAND_DISPLAY_NAME"];
  if (name !== undefined) {
    return name;
  }
  for (let i = 2; i < 1000; i++) {
    // const socket_name = `term-everything-${i}`;
    const socket_name = `wayland-${i}`;
    const path = cpp.get_socket_path_from_name(socket_name);
    if (
      statSync(path, {
        throwIfNoEntry: false,
      })
    ) {
      continue;
    }
    // console.log(
    //   `Found open wayland socket name: ${socket_name}, at path ${path}`
    // );
    return socket_name;
  }
  console.error(`Failed to find an open wayland socket name.
    Pass one in manually with --wayland-display-name <name>`);
  process.exit(1);
};
