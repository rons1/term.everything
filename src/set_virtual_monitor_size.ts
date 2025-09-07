import { Pixels } from "./Terminal_Window.ts";
import { virtual_monitor_size } from "./virtual_monitor_size.ts";

export const set_virtual_monitor_size = (
  new_virtual_monitor_size: string | undefined
) => {
  if (!new_virtual_monitor_size) {
    return;
  }
  const [width, height] = new_virtual_monitor_size.split("x").map(Number);
  if (isNaN(width) || isNaN(height)) {
    console.error(
      `Invalid virtual monitor size ${new_virtual_monitor_size}, expected <width>x<height>`
    );
    process.exit(1);
  }
  if (width <= 0 || height <= 0) {
    console.error(
      `Invalid virtual monitor size ${new_virtual_monitor_size}, expected <width>x<height>`
    );
    process.exit(1);
  }
  virtual_monitor_size.width = width as Pixels;
  virtual_monitor_size.height = height as Pixels;
};
