#include "mmap_fd.h"
#include "Client_State.h"
#include <iostream>

Value mmap_shm_pool_js(const CallbackInfo &info)
{
  auto client_state = info[0].As<External<ClientState>>().Data();
  auto fd = info[1].As<Number>().Int32Value();
  auto size = info[2].As<Number>().Int64Value();
  auto shm_pool_id = info[3].As<Number>().Uint32Value();

  if (client_state->shm_pool_memory.find(shm_pool_id) != client_state->shm_pool_memory.end())
  {
    std::cerr << "shm_pool_id already exists " << shm_pool_id << std::endl;
    return Boolean::New(info.Env(), false);
  }

  auto shm_pool_memory = new SHM_Pool_Memory(fd, size);
  if (shm_pool_memory->destroyed())
  {
    delete shm_pool_memory;
    return Boolean::New(info.Env(), false);
  }
  client_state->shm_pool_memory[shm_pool_id] = shm_pool_memory;
  return Boolean::New(info.Env(), true);
}

Value remap_shm_pool_js(const CallbackInfo &info)
{
  auto client_state = info[0].As<External<ClientState>>().Data();
  auto shm_pool_id = info[1].As<Number>().Uint32Value();
  auto new_size = info[2].As<Number>().Int64Value();

  auto pool_it = client_state->shm_pool_memory.find(shm_pool_id);

  if (pool_it == client_state->shm_pool_memory.end())
  {
    std::cerr << "shm_pool_id does not exist in map, has it been created yet? id: " << shm_pool_id << std::endl;
    return Boolean::New(info.Env(), false);
  }
  auto pool = pool_it->second;
  if (!pool->remap(new_size))
  {
    /**
     * @brief Destroy the state if it failed to remap
     */
    delete pool;
    client_state->shm_pool_memory.erase(shm_pool_id);
    return Boolean::New(info.Env(), false);
  }

  return Boolean::New(info.Env(), true);
}

Value unmmap_shm_pool_js(const CallbackInfo &info)
{
  auto client_state = info[0].As<External<ClientState>>().Data();
  auto shm_pool_id = info[1].As<Number>().Uint32Value();
  auto pool_it = client_state->shm_pool_memory.find(shm_pool_id);

  if (pool_it == client_state->shm_pool_memory.end())
  {
    /**
     * Already doesn't, exist
     * don't worry about it
     *
     */
    return info.Env().Undefined();
  }
  auto pool = pool_it->second;
  delete pool;
  client_state->shm_pool_memory.erase(shm_pool_id);
  return info.Env().Undefined();
}

// #include <fcntl.h>
// #include <sys/mman.h>
// #include <iostream>
// #include <unistd.h>

// Value close_fd_js(const CallbackInfo &info) {
//   auto fd = info[0].As<Number>().Int32Value();
//   auto ret = close(fd);
//   if (ret == -1) {
//     perror("close");
//     return info.Env().Null();
//   }
//   return info.Env().Undefined();
// }

// /**
//  * @brief
//  *
//  * @param addr
//  * @param size
//  * @return true on success
//  * @return false  on failure
//  */
// bool unmmap(void *addr, size_t size) {
//   auto bob = munmap(addr, size);
//   if (bob == -1) {
//     perror("unmmap");
//     return false;
//   }
//   return true;
// }

// Value unmmap_js(const CallbackInfo &info) {
//   auto addr_obj = info[0].As<Object>();
//   auto ret = unmmap(addr_obj.Get("addr").As<External<void>>(),
//                     addr_obj.Get("size").As<Number>().Int64Value());

//   return Boolean::New(info.Env(), ret);
// }

// void *remap_mmap(void *addr, size_t old_size, size_t new_size) {
//   if(!unmmap(addr, old_size)){
//     return MAP_FAILED;
//   }
//   mmap_fd(-1, new_size);

// // // #ifdef __APPLE__
// //   // Allocate new memory region
// //   auto new_addr = mmap(nullptr, new_size, PROT_READ | PROT_WRITE,
// //                         MAP_SHARED | MAP_ANON, -1, 0);
// //   if (new_addr == MAP_FAILED) {
// //     return MAP_FAILED;
// //   }

// //   // Copy data from old region to new region
// //   memcpy(new_addr, addr, old_size < new_size ? old_size : new_size);

// //   // Unmap old memory region
// //   if (munmap(addr, old_size) == -1) {
// //     perror("munmap");
// //     munmap(new_addr, new_size);
// //     return MAP_FAILED;
// //   }

//   // return new_addr;
// // #else
//   // // Debugging output
//   // std::cout << "remap_mmap: addr=" << addr << ", old_size=" << old_size << ", new_size=" << new_size << std::endl;

//   // void *new_addr = mremap(addr, old_size, new_size, MREMAP_MAYMOVE);
//   // if (new_addr == MAP_FAILED) {
//   //   std::cerr << "mremap failed: " << strerror(errno) << std::endl;
//   // }
//   // return new_addr;

//   // // return mremap(addr, old_size, new_size, MREMAP_MAYMOVE);
// // #endif
// }

// Value remap_mmap_js(const CallbackInfo &info) {
//   auto fd = info[0].As<Number>().Int32Value();
//   auto addr_obj = info[1].As<Object>();
//   auto new_size = info[2].As<Number>().Int64Value();
//   auto new_addr =
//       remap_mmap(addr_obj.Get("addr").As<External<void>>(),
//                  addr_obj.Get("size").As<Number>().Int64Value(), new_size);
//   if (new_addr == MAP_FAILED) {
//     perror("remap_mmap");
//     return info.Env().Null();
//   }
//   addr_obj.Set(
//       "addr",
//       External<void>::New(info.Env(), new_addr, [](Env env, void *data) {
//         /**no unmapping here, because it would be unmaped after remap */
//       }));
//   addr_obj.Set("size", Number::New(info.Env(), new_size));

//   return addr_obj;
// }

// Value mmap_fd_js(const CallbackInfo &info) {
//   auto fd = info[0].As<Number>().Int32Value();
//   auto size = info[1].As<Number>().Int64Value();
//   auto addr = mmap_fd(fd, size);
//   if (addr == MAP_FAILED) {

//     return info.Env().Null();
//   }

//   auto obj = Object::New(info.Env());
//   obj.Set(
//       "addr", External<void>::New(info.Env(), addr, [](Env env, void *data) {
//         /**  If we munapped here, he would accidentally munmap after a remap */
//       }));
//   obj.Set("size", Number::New(info.Env(), size));

//   return obj;
// }