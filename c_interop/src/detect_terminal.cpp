#include "detect_terminal.h"

void detect_terminal(ChafaTermInfo **term_info_out,
                     ChafaCanvasMode *mode_out,
                     ChafaPixelMode *pixel_mode_out)

{

    // ChafaTermInfo *fallback_info;

    /* Examine the environment variables and guess what the terminal can do */

    auto envp = g_get_environ();

    

    auto term_info = chafa_term_db_detect(chafa_term_db_get_default(), envp);
    ChafaPixelMode pixel_mode;
    ChafaCanvasMode mode;

    /* See which control sequences were defined, and use that to pick the most
     * high-quality rendering possible */
    if (chafa_term_info_have_seq(term_info, CHAFA_TERM_SEQ_BEGIN_ITERM2_IMAGE))
    {
        pixel_mode = CHAFA_PIXEL_MODE_ITERM2;
        mode = CHAFA_CANVAS_MODE_TRUECOLOR;
    }
    else if (chafa_term_info_have_seq(term_info, CHAFA_TERM_SEQ_BEGIN_KITTY_IMMEDIATE_IMAGE_V1))
    {
        pixel_mode = CHAFA_PIXEL_MODE_KITTY;
        mode = CHAFA_CANVAS_MODE_TRUECOLOR;
    }
    else if (chafa_term_info_have_seq(term_info, CHAFA_TERM_SEQ_BEGIN_SIXELS))
    {
        pixel_mode = CHAFA_PIXEL_MODE_SIXELS;
        mode = CHAFA_CANVAS_MODE_TRUECOLOR;
    }
    else
    {
        pixel_mode = CHAFA_PIXEL_MODE_SYMBOLS;

        if (chafa_term_info_have_seq(term_info, CHAFA_TERM_SEQ_SET_COLOR_FGBG_DIRECT) && chafa_term_info_have_seq(term_info, CHAFA_TERM_SEQ_SET_COLOR_FG_DIRECT) && chafa_term_info_have_seq(term_info, CHAFA_TERM_SEQ_SET_COLOR_BG_DIRECT))
            mode = CHAFA_CANVAS_MODE_TRUECOLOR;
        else if (chafa_term_info_have_seq(term_info, CHAFA_TERM_SEQ_SET_COLOR_FGBG_256) && chafa_term_info_have_seq(term_info, CHAFA_TERM_SEQ_SET_COLOR_FG_256) && chafa_term_info_have_seq(term_info, CHAFA_TERM_SEQ_SET_COLOR_BG_256))
            mode = CHAFA_CANVAS_MODE_INDEXED_240;
        else if (chafa_term_info_have_seq(term_info, CHAFA_TERM_SEQ_SET_COLOR_FGBG_16) && chafa_term_info_have_seq(term_info, CHAFA_TERM_SEQ_SET_COLOR_FG_16) && chafa_term_info_have_seq(term_info, CHAFA_TERM_SEQ_SET_COLOR_BG_16))
            mode = CHAFA_CANVAS_MODE_INDEXED_16;
        else if (chafa_term_info_have_seq(term_info, CHAFA_TERM_SEQ_INVERT_COLORS) && chafa_term_info_have_seq(term_info, CHAFA_TERM_SEQ_RESET_ATTRIBUTES))
            mode = CHAFA_CANVAS_MODE_FGBG_BGFG;
        else
            mode = CHAFA_CANVAS_MODE_FGBG;
    }

    /* Hand over the information to caller */

    *term_info_out = term_info;
    *mode_out = mode;
    *pixel_mode_out = pixel_mode;

    /* Cleanup */

    g_strfreev(envp);
}