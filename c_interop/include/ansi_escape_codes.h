#pragma once

namespace escape_codes
{
    constexpr auto move_cursor_to_home = "\033[H";
    constexpr auto clear_screen = "\033[2J";
    constexpr auto clear_line = "\033[2K";
    constexpr auto clear_line_after_cursor = "\033[0K";
    constexpr auto hide_cursor = "\033[?25l";
}
