export const debug_turn_off_output = () => {
  return process.env["DEBUG_TURN_OFF_OUTPUT"] !== undefined;

  // return false;
  // return true;
};
