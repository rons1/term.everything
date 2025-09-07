#pragma once
#include <map>
#include "SHM_Pool_Memory.h"

/**
 * @brief The client state will be garbage collected by javascript gc.
 *  it is the collection of state that the client has.
 *
 */

class ClientState
{
public:
  std::map<Object_ID_wl_shm_pool_t, SHM_Pool_Memory *> shm_pool_memory = {};
  ~ClientState();
};