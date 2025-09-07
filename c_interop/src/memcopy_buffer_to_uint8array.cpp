#include "memcopy_buffer_to_uint8array.h"
#include "Client_State.h"
#include <iostream>

Value memcopy_buffer_to_uint8array_js(const CallbackInfo &info)
{
  auto env = info.Env();
  auto client_state = info[0].As<External<ClientState>>().Data();
  auto pool_id = info[1].As<Number>().Uint32Value();
  auto offset = info[2].As<Number>().Uint32Value();

  auto uint8_array = info[3].As<Uint8Array>();
  auto flip_colors = info[4].As<Boolean>().Value();

  auto pool_it = client_state->shm_pool_memory.find(pool_id);
  if (pool_it == client_state->shm_pool_memory.end())
  {
    std::cerr << "memcopy_buffer_to_texture: shm_pool_id does not exist in map, has it been created yet? id: " << pool_id << std::endl;
    return Boolean::New(env, false);
  }

  auto pool = pool_it->second;
  if (pool->destroyed())
  {
    std::cerr << "memcopy_buffer_to_texture: pool is destroyed cannot copy from it" << std::endl;
    return Boolean::New(env, false);
  }
  if (offset + uint8_array.ByteLength() > pool->size)
  {
    std::cerr << "memcopy_buffer_to_texture: offset + size is greater than pool size" << std::endl;
    return Boolean::New(env, false);
  }
  auto buffer_data = static_cast<uint8_t *>(pool->addr);
  auto dest_data = uint8_array.Data();
  size_t length = uint8_array.ByteLength();
  /**
   * @brief Convert from RGBA to BGRA
   *
   */
  if (flip_colors)
  {
    for (size_t i = 0; i < length; i += 4)
    {
      dest_data[i] = buffer_data[offset + i + 2];     // B
      dest_data[i + 1] = buffer_data[offset + i + 1]; // G
      dest_data[i + 2] = buffer_data[offset + i];     // R
      dest_data[i + 3] = buffer_data[offset + i + 3]; // A
    }
  }
  else
  {
    memcpy(
        dest_data,
        buffer_data + offset,
        length);
  }

   return Boolean::New(env, true);
}
