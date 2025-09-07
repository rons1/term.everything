#pragma once
#include <napi.h>
using namespace Napi;

std::string get_socket_path_from_name(const std::string &socket_name);
Value get_socket_path_from_name_js(const CallbackInfo &info);
