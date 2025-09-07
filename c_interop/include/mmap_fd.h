#pragma once
#include <napi.h>

using namespace Napi;
Value mmap_shm_pool_js(const CallbackInfo &info);
Value remap_shm_pool_js(const CallbackInfo &info);
Value unmmap_shm_pool_js(const CallbackInfo &info);