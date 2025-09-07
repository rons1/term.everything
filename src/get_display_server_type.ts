import Bun from "bun";

export class Display_Server_Type {
  type: "x11" | "wayland" | "unknown";
  constructor() {
    const type = Bun.env["XDG_SESSION_TYPE"];
    switch (type) {
      case "x11":
        this.type = "x11";
        break;
      case "wayland":
        this.type = "wayland";
        break;
      default:
        this.type = "unknown";
        break;
    }
  }
}
