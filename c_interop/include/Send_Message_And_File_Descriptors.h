#pragma once
#include <napi.h>
using namespace Napi;
Value send_message_and_file_descriptors_js(const CallbackInfo &info);