
export enum Ansi_Escape_Codes {
  disable_alternative_screen_buffer = "\x1b[?1049l",
  enable_alternative_screen_buffer = "\x1b[?1049h",
  enable_mouse_tracking = "\x1b[?1003h",
  disable_mouse_tracking = "\x1b[?1003l",

  hide_cursor = "\x1b[?25l",
  show_cursor = "\x1b[?25h"
}
