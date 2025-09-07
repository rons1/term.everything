export const on_exit = (callback: () => void) => {
  [
    "exit",
    "uncaughtException",
    "SIGINT",
    "SIGQUIT",
    "SIGTERM",
    "SIGUSR1",
    "SIGUSR2",
  ].forEach((eventType) => {
    process.on(eventType, callback);
  });
};
