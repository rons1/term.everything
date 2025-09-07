/**
 *
 * @param message Don't use this is for logging,
 * it's black out the screen and feels terrible
 */
export const log_to_main_screen = (_message: any) => {
  /**
   * disable alternative screen buffer
   */
  //// process.stdout.write(AnsiEscapeCodes.disable_alternative_screen_buffer);

  // console.log(message);

  /**
   * alternative screen buffer
   */
  // // process.stdout.write(AnsiEscapeCodes.enable_alternative_screen_buffer);
};
