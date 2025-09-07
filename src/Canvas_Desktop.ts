import {
  Canvas,
  CanvasRenderingContext2D,
  createCanvas,
  Image,
  loadImage,
} from "canvas";
import { Size } from "./Size.ts";
import { Wayland_Client } from "./Wayland_Client.ts";
import { wl_surface } from "./objects/wl_surface.ts";
import { Buffer } from "buffer";
//@ts-ignore
import icon from "../resources/icon.png" with { type: "file" };

export class Canvas_Desktop {
  canvas: Canvas;
  context: CanvasRenderingContext2D;
  icon_image: Image | null = null;
  after_opening_timeout = false;

  draw_image = (image: Image | null, x: number, y: number) => {
    if (!image) {
      return;
    }
    this.context.drawImage(image, x, y);
  };

  constructor(size: Size, will_show_app_right_at_startup: boolean) {
    /**
     * If we will show an app right at startup,
     * we want to wait a bit before potentially
     * drawing the icon. Otherwise it will
     * flash the icon, and the show the app
     * content which is annoying.
     *
     */
    if (!will_show_app_right_at_startup) {
      this.after_opening_timeout = true;
    } else {
      Bun.sleep(500).then(() => {
        this.after_opening_timeout = true;
      });
    }

    this.canvas = createCanvas(size.width, size.height);

    this.context = this.canvas.getContext("2d")!;
    Bun.file(icon)
      .arrayBuffer()
      .then(async (buffer) => {
        this.icon_image = await loadImage(Buffer.from(buffer));
      });
  }
  draw_clients = (clients: Set<Wayland_Client>) => {
    /**
     * Do z sorting
     * of all drawable surfaces
     */
    const sorted_surfaces: [wl_surface, Canvas][] = [];
    for (const s of clients) {
      for (const surface_id of s.drawable_surfaces) {
        const surface = s.get_object(surface_id)?.delegate;
        if (!surface) {
          continue;
        }
        if (!surface.texture) {
          continue;
        }
        if (!surface.texture.canvas) {
          continue;
        }

        sorted_surfaces.push([surface, surface.texture.canvas]);
      }
    }
    sorted_surfaces.sort((a, b) => {
      return a[0].position.z - b[0].position.z;
    });

    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (sorted_surfaces.length <= 0 && this.after_opening_timeout) {
      this.draw_image(this.icon_image, 0, 0);
    }

    for (const [surface, texture] of sorted_surfaces) {
      this.context.drawImage(texture, surface.position.x, surface.position.y);
    }
  };
}
