#pragma once

#include "chafa.h"

/**
 * @brief public domain from chafa
 *
 * @param term_info_out
 * @param mode_out
 * @param pixel_mode_out
 */
void detect_terminal(ChafaTermInfo **term_info_out,
                     ChafaCanvasMode *mode_out,
                     ChafaPixelMode *pixel_mode_out);