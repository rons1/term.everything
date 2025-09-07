#include "SHM_Pool_Memory.h"

#include <fcntl.h>
#include <sys/mman.h>
#include <iostream>
#include <unistd.h>

static void *mmap_fd(int fd, size_t size)
{
    auto prot = PROT_READ | PROT_WRITE;
    auto flags = MAP_SHARED;
    auto addr = mmap(nullptr, size, prot, flags, fd, 0);
    if (addr == MAP_FAILED)
    {
        perror("mmap");
        return MAP_FAILED;
    }

    return addr;
}

bool SHM_Pool_Memory::destroyed()
{
    return addr == MAP_FAILED;
}

SHM_Pool_Memory::SHM_Pool_Memory(int fd, size_t size)
{
    this->file_descriptor = fd;
    this->addr = mmap_fd(fd, size);
    this->size = size;
}

bool SHM_Pool_Memory::remap(size_t new_size)
{
    if (new_size == size)
    {
        return true;
    }
    if (addr == MAP_FAILED)
    {
        return false;
    }
    if (munmap(addr, size) == -1)
    {
        perror("munmap in remap");
        this->addr = MAP_FAILED;
        return false;
    }
    addr = mmap_fd(file_descriptor, new_size);
    if (addr == MAP_FAILED)
    {
        perror("mmap in remap");
        return false;
    }
    size = new_size;
    return true;
}

SHM_Pool_Memory::~SHM_Pool_Memory()
{

    if (addr != MAP_FAILED)
    {
        munmap(addr, size);
    }
    if (file_descriptor != -1)
    {
        close(file_descriptor);
    }
}