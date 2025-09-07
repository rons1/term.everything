#include "remove_file_if_it_exists.h"

#include <iostream>
#include <unistd.h>
#include <sys/socket.h>
#include <sys/un.h>

int remove_file_if_it_exists(std::string &file_path)
{
    if (access(file_path.c_str(), F_OK) == 0)
    {
        if (remove(file_path.c_str()) != 0)
        {
            perror("remove");
            std::cerr << "Error removing existing socket file" << std::endl;
            return -1;
        }
    }
    return 0;
}
