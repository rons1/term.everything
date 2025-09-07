#pragma once
#include <stdint.h>
#include <cstddef>
typedef uint32_t Object_ID_wl_shm_pool_t;

class SHM_Pool_Memory
{
public:
    SHM_Pool_Memory(int fd, size_t size);
    int file_descriptor;
    void *addr;
    size_t size;

    bool destroyed();

    bool remap(size_t new_size);

    ~SHM_Pool_Memory();
};