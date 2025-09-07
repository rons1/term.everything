#include "ChafaInfo.h"
#include "detect_terminal.h"

GString *ChafaInfo::convert_image(uint8_t *texture_pixels,
                                  uint32_t texture_width,
                                  uint32_t texture_height,
                                  uint32_t texture_stride)
{

    chafa_canvas_draw_all_pixels(canvas,
                                 pixel_mode == CHAFA_PIXEL_MODE_KITTY && !session_type_is_x11 ? CHAFA_PIXEL_RGBA8_UNASSOCIATED : CHAFA_PIXEL_BGRA8_UNASSOCIATED,
                                 //   CHAFA_PIXEL_BGRA8_UNASSOCIATED,
                                 //   CHAFA_PIXEL_RGBA8_UNASSOCIATED,
                                 //  CHAFA_PIXEL_ARGB8_UNASSOCIATED,
                                 texture_pixels,
                                 texture_width,
                                 texture_height,
                                 texture_stride);
    auto printable = chafa_canvas_print(canvas, term_info);
    return printable;
}

ChafaInfo::ChafaInfo(gint width_cells,
                     gint height_cells,
                     gint width_of_a_cell_in_pixels,
                     gint height_of_a_cell_in_pixels,
                     bool session_type_is_x11) : width_cells(width_cells),
                                                 height_cells(height_cells),
                                                 width_of_a_cell_in_pixels(width_of_a_cell_in_pixels),
                                                 height_of_a_cell_in_pixels(height_of_a_cell_in_pixels),
                                                 session_type_is_x11(session_type_is_x11)
{
    {
        detect_terminal(&term_info, &mode, &pixel_mode);

        /* Specify the symbols we want */

        symbol_map = chafa_symbol_map_new();
        // chafa_symbol_map_add_by_tags(symbol_map, CHAFA_SYMBOL_TAG_BLOCK);
        // chafa_symbol_map_add_by_tags(symbol_map, CHAFA_SYMBOL_TAG_ASCII);
        chafa_symbol_map_add_by_tags(symbol_map, CHAFA_SYMBOL_TAG_ALL);

        /* Set up a configuration with the symbols and the canvas size in characters */

        config = chafa_canvas_config_new();
        chafa_canvas_config_set_canvas_mode(config, mode);
        chafa_canvas_config_set_pixel_mode(config, pixel_mode);
        chafa_canvas_config_set_geometry(config, width_cells, height_cells);
        chafa_canvas_config_set_symbol_map(config, symbol_map);
        // chafa_canvas_config_set_optimizations(config, TRUE);
        chafa_canvas_config_set_work_factor(config, 0.0);
        // chafa_canvas_config_set_preprocessing_enabled(config, FALSE);
        // chafa_canvas_config_set_dither_intensity(config, CHAFA_DITHER_MODE_DIFFUSION);

        if (width_of_a_cell_in_pixels > 0 && height_of_a_cell_in_pixels > 0)
        {
            /* We know the pixel dimensions of each cell. Store it in the config. */

            chafa_canvas_config_set_cell_geometry(config, width_of_a_cell_in_pixels, height_of_a_cell_in_pixels);
        }

        canvas = chafa_canvas_new(config);
    }
}

ChafaInfo::~ChafaInfo()
{
    chafa_canvas_unref(canvas);
    chafa_canvas_config_unref(config);
    chafa_symbol_map_unref(symbol_map);
    chafa_term_info_unref(term_info);
}
