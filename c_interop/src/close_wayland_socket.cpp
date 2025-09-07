#include "close_wayland_socket.h"
#include "get_socket_path_from_name.h"
#include "remove_file_if_it_exists.h"

#include <unistd.h>

Value close_wayland_socket_js(const CallbackInfo &info)
{
  auto socket_name = info[0].As<String>().Utf8Value();
  auto socket_file_descriptor = info[1].As<Number>().Int32Value();

  auto socket_path = get_socket_path_from_name(socket_name);

  remove_file_if_it_exists(socket_path);

  close(socket_file_descriptor);

  auto env = info.Env();

  return env.Undefined();
}
