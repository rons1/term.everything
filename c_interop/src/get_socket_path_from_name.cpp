#include "get_socket_path_from_name.h"

std::string get_socket_path_from_name(const std::string &socket_name)
{
    auto maybe_runtime_dir = std::getenv("XDG_RUNTIME_DIR");

    auto runtime_dir = maybe_runtime_dir == nullptr ? "/tmp" : maybe_runtime_dir;

    return std::string(runtime_dir) + "/" + socket_name;
}

Value get_socket_path_from_name_js(const CallbackInfo &info)
{
    auto socket_name = info[0].As<String>().Utf8Value();
    auto env = info.Env();
    return String::New(env, get_socket_path_from_name(socket_name));
}
