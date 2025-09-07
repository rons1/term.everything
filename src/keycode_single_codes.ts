import {
  Key_code,
  alpha_keys,
  LINUX_MODIFIERS,
  numeric_keys,
} from "./convert_keycode_to_xbd_code.ts";
import { Linux_Event_Codes } from "./Linux_Event_Codes.ts";
import { log_to_main_screen } from "./log_to_main_screen.ts";

export const keycode_single_codes = (d: number): Key_code | null => {
  if (d >= 1 && d <= 26) {
    /**
     * @TODO not sure what to do about the
     * ctrl+keys that are shadowed
     * by these keys
     */
    switch (d) {
      case 3:
      case 9:
      case 13:
        break;
      default: {
        return {
          type: "key_code",
          key_code: alpha_keys[d - 1]!,
          modifiers: LINUX_MODIFIERS.control,
        };
      }
    }
  }
  if (d >= 48 && d <= 57) {
    return {
      type: "key_code",
      key_code: numeric_keys[d - 48]!,
      modifiers: 0,
    };
  }
  if (d >= 65 && d <= 90) {
    return {
      type: "key_code",

      key_code: alpha_keys[d - 65]!,
      modifiers: LINUX_MODIFIERS.shift,
    };
  }
  if (d >= 97 && d <= 122) {
    return {
      type: "key_code",
      key_code: alpha_keys[d - 97]!,
      modifiers: 0,
    };
  }

  switch (d) {
    case 33:
      /**
       * !
       * */
      return {
        type: "key_code",
        key_code: Linux_Event_Codes.KEY_1,
        modifiers: LINUX_MODIFIERS.shift,
      };
    case 64:
      /**
       * @
       * */
      return {
        type: "key_code",
        key_code: Linux_Event_Codes.KEY_2,
        modifiers: LINUX_MODIFIERS.shift,
      };
    case 35:
      /**
       * #
       *  */
      return {
        type: "key_code",
        key_code: Linux_Event_Codes.KEY_3,
        modifiers: LINUX_MODIFIERS.shift,
      };
    case 36:
      /**
       * $
       * */
      return {
        type: "key_code",
        key_code: Linux_Event_Codes.KEY_4,
        modifiers: LINUX_MODIFIERS.shift,
      };

    case 37:
      /**
       * %
       * */
      return {
        type: "key_code",
        key_code: Linux_Event_Codes.KEY_5,
        modifiers: LINUX_MODIFIERS.shift,
      };
    case 34:
      /**
       * "
       */
      return {
        type: "key_code",
        key_code: Linux_Event_Codes.KEY_APOSTROPHE,
        modifiers: LINUX_MODIFIERS.shift,
      };
    case 39:
      /**
       * '
       */
      return {
        type: "key_code",
        key_code: Linux_Event_Codes.KEY_APOSTROPHE,
        modifiers: 0,
      };
    case 94:
      /**
       * ^
       * */
      return {
        type: "key_code",
        key_code: Linux_Event_Codes.KEY_6,
        modifiers: LINUX_MODIFIERS.shift,
      };
    case 38:
      /**
       * &
       * */
      return {
        type: "key_code",
        key_code: Linux_Event_Codes.KEY_7,
        modifiers: LINUX_MODIFIERS.shift,
      };
    case 42:
      /**
       * *
       * */
      return {
        type: "key_code",
        key_code: Linux_Event_Codes.KEY_8,
        modifiers: LINUX_MODIFIERS.shift,
      };
    case 40:
      /**
       * (
       * */
      return {
        type: "key_code",
        key_code: Linux_Event_Codes.KEY_9,
        modifiers: LINUX_MODIFIERS.shift,
      };
    case 41:
      /**
       * )
       * */
      return {
        type: "key_code",
        key_code: Linux_Event_Codes.KEY_0,
        modifiers: LINUX_MODIFIERS.shift,
      };

    case 3:
      /**
       * escape
       */
      return {
        type: "key_code",
        key_code: Linux_Event_Codes.KEY_ESC,
        modifiers: 0,
      };
    case 27:
      /**
       * escape
       */
      return {
        type: "key_code",
        key_code: Linux_Event_Codes.KEY_ESC,
        modifiers: LINUX_MODIFIERS.shift,
      };
    case 96:
      /**
       * `
       */
      return {
        type: "key_code",
        key_code: Linux_Event_Codes.KEY_GRAVE,
        modifiers: 0,
      };
    case 126:
      /**
       * ~
       * */
      return {
        type: "key_code",
        key_code: Linux_Event_Codes.KEY_GRAVE,
        modifiers: LINUX_MODIFIERS.shift,
      };
    case 45:
      /**
       * -
       */
      return {
        type: "key_code",
        key_code: Linux_Event_Codes.KEY_MINUS,
        modifiers: 0,
      };
    case 95:
      /**
       * _
       *
       * */
      return {
        type: "key_code",
        key_code: Linux_Event_Codes.KEY_MINUS,
        modifiers: LINUX_MODIFIERS.shift,
      };
    case 61:
      /**
       * =
       * */
      return {
        type: "key_code",
        key_code: Linux_Event_Codes.KEY_EQUAL,
        modifiers: 0,
      };
    case 43:
      /**
       * +
       * */
      return {
        type: "key_code",
        key_code: Linux_Event_Codes.KEY_EQUAL,
        modifiers: LINUX_MODIFIERS.shift,
      };
    case 8:
      /**
       * CTRL+backspace
       * overshadowed be CTRL+H
       */
      return {
        type: "key_code",
        key_code: Linux_Event_Codes.KEY_BACKSPACE,
        modifiers: LINUX_MODIFIERS.control,
      };
    case 127:
      /**
       * backspace
       */
      return {
        type: "key_code",
        key_code: Linux_Event_Codes.KEY_BACKSPACE,
        modifiers: 0,
      };
    case 9:
      /**
       * tab
       */
      return {
        type: "key_code",
        key_code: Linux_Event_Codes.KEY_TAB,
        modifiers: 0,
      };
    case 13:
      /**
       * enter
       */
      return {
        type: "key_code",
        key_code: Linux_Event_Codes.KEY_ENTER,
        modifiers: 0,
      };
    case 32:
      /**
       * space
       */
      return {
        type: "key_code",
        key_code: Linux_Event_Codes.KEY_SPACE,
        modifiers: 0,
      };
    case 0:
      /**
       * ctrl + space
       */
      return {
        type: "key_code",
        key_code: Linux_Event_Codes.KEY_SPACE,
        modifiers: LINUX_MODIFIERS.control,
      };

    case 59:
      /**
       * semicolon
       */
      return {
        type: "key_code",
        key_code: Linux_Event_Codes.KEY_SEMICOLON,
        modifiers: 0,
      };
    case 58:
      /**
       * colon
       */
      return {
        type: "key_code",
        key_code: Linux_Event_Codes.KEY_SEMICOLON,
        modifiers: LINUX_MODIFIERS.shift,
      };
    case 91:
      /**
       * left square bracket
       */
      return {
        type: "key_code",
        key_code: Linux_Event_Codes.KEY_LEFTBRACE,
        modifiers: 0,
      };
    case 123:
      /**
       * left square bracket
       */
      return {
        type: "key_code",
        key_code: Linux_Event_Codes.KEY_LEFTBRACE,
        modifiers: LINUX_MODIFIERS.shift,
      };
    case 93:
      /**
       * right square bracket
       */
      return {
        type: "key_code",
        key_code: Linux_Event_Codes.KEY_RIGHTBRACE,
        modifiers: 0,
      };
    case 125:
      /**
       * right square bracket
       */
      return {
        type: "key_code",
        key_code: Linux_Event_Codes.KEY_RIGHTBRACE,
        modifiers: LINUX_MODIFIERS.shift,
      };
    case 129:
      /**
       * ctrl+ right square bracket
       */
      return {
        type: "key_code",
        key_code: Linux_Event_Codes.KEY_RIGHTBRACE,
        modifiers: LINUX_MODIFIERS.control,
      };

    case 92:
      /**
       * backslash
       */
      return {
        type: "key_code",
        key_code: Linux_Event_Codes.KEY_BACKSLASH,
        modifiers: 0,
      };
    case 124:
      /**
       * pipe
       */
      return {
        type: "key_code",
        key_code: Linux_Event_Codes.KEY_BACKSLASH,
        modifiers: LINUX_MODIFIERS.shift,
      };
    case 44:
      /**
       * comma
       */
      return {
        type: "key_code",
        key_code: Linux_Event_Codes.KEY_COMMA,
        modifiers: 0,
      };
    case 60:
      /**
       * less than
       */
      return {
        type: "key_code",
        key_code: Linux_Event_Codes.KEY_COMMA,
        modifiers: LINUX_MODIFIERS.shift,
      };
    case 46:
      /**
       * period
       */
      return {
        type: "key_code",
        key_code: Linux_Event_Codes.KEY_DOT,
        modifiers: 0,
      };
    case 62:
      /**
       * greater than
       */
      return {
        type: "key_code",
        key_code: Linux_Event_Codes.KEY_DOT,
        modifiers: LINUX_MODIFIERS.shift,
      };
    case 47:
      /**
       * forward slash
       */
      return {
        type: "key_code",
        key_code: Linux_Event_Codes.KEY_SLASH,
        modifiers: 0,
      };
    case 63:
      /**
       * question mark
       */
      return {
        type: "key_code",
        key_code: Linux_Event_Codes.KEY_SLASH,
        modifiers: LINUX_MODIFIERS.shift,
      };
    case 31:
      /**
       * ctrl /
       */
      return {
        type: "key_code",
        key_code: Linux_Event_Codes.KEY_SLASH,
        modifiers: LINUX_MODIFIERS.control,
      };
  }
  log_to_main_screen(`Unrecognized key code: ${d}`);
  return null;
};
