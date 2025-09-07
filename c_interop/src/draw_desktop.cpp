#include "draw_desktop.h"

#include "Client_State.h"
#include "chafa.h"

#include <iostream>

#include "TermSize.h"

#include "Draw_State.h"
#include <sstream>

#include "ansi_escape_codes.h"

Value draw_desktop_js(const CallbackInfo &info)
{

  auto s = info[0].As<External<Draw_State>>().Data();

  auto desktop_buffer = info[1].As<Buffer<uint8_t>>();

  auto width = info[2].As<Number>().Uint32Value();
  auto height = info[3].As<Number>().Uint32Value();
  auto status_line = info[4].As<String>().Utf8Value();
  auto have_status_line = status_line.length() > 0;

  /* Get the terminal dimensions and determine the output size, preserving
   * aspect ratio */
  TermSize term_size;

  auto width_cells = term_size.width_cells;

  gint status_line_height = have_status_line ? 1 : 0;
  auto height_cells = term_size.height_cells - status_line_height;

  chafa_calc_canvas_geometry(width,
                             height,
                             &width_cells,
                             &height_cells,
                             term_size.font_ratio,
                             TRUE,
                             FALSE);

  s->resize_chafa_info_if_needed(
      width_cells,
      height_cells,
      term_size);

  // auto printable = s->convert_current_desktop_to_ansi();
  auto printable = s->chafa_info->convert_image(desktop_buffer.Data(),
                                                width,
                                                height,
                                                width * 4);

  std::stringstream ss;
  if (have_status_line)
  {
    ss << escape_codes::move_cursor_to_home << status_line.c_str() << escape_codes::clear_line_after_cursor << std::endl;
  }
  ss << printable->str;

  // ss << escape_codes::move_cursor_to_home
  //    << printable->str;
  auto out_string = ss.str();

  fwrite(out_string.c_str(), sizeof(char), out_string.length(), stdout);
  fflush(stdout);
  g_string_free(printable, TRUE);

  auto out = Object::New(info.Env());
  out.Set("width_cells", Number::New(info.Env(), width_cells));
  out.Set("height_cells", Number::New(info.Env(), height_cells));

  return out;
}
