#include "Client_State.h"

ClientState::~ClientState()
{

  for (auto &shm_pool_pair : shm_pool_memory)
  {
    delete shm_pool_pair.second;
  }
}