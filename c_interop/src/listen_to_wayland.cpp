#include "listen_to_wayland.h"
#include "get_socket_path_from_name.h"
#include "remove_file_if_it_exists.h"

#include <iostream>
#include <sys/socket.h>
#include <sys/un.h>

#include <napi.h>

using namespace Napi;

/**
 * @brief
 *
 * @return int -1 on error, socket file descriptor on success
 */
int listen_to_wayland_socket(std::string &socket_name)
{
    auto socket_path = get_socket_path_from_name(socket_name);

    // auto maybe_runtime_dir = std::getenv("XDG_RUNTIME_DIR");

    // auto runtime_dir = maybe_runtime_dir == nullptr ? "/tmp" : maybe_runtime_dir;

    // auto socket_path = std::string(runtime_dir) + "/" + socket_name;
    // if (access(socket_path.c_str(), F_OK) == 0)
    // {
    //     if (remove(socket_path.c_str()) != 0)
    //     {
    //         perror("remove");
    //         std::cerr << "Error removing existing socket file" << std::endl;
    //         return -1;
    //     }
    // }

    if (remove_file_if_it_exists(socket_path))
    {
        return -1;
    }

    auto socket_file_descriptor = socket(AF_UNIX, SOCK_STREAM, 0);
    if (socket_file_descriptor == -1)
    {
        perror("socket");
        std::cerr << "Error creating socket" << std::endl;
        return -1;
    }

    struct sockaddr_un address = {0};
    address.sun_family = AF_UNIX;
    strncpy(address.sun_path, socket_path.c_str(), sizeof(address.sun_path) - 1);

    if (bind(socket_file_descriptor, (struct sockaddr *)&address, sizeof(address)) == -1)
    {
        perror("bind");
        std::cerr << "Error binding socket..." << std::endl;
        return -1;
    }

    if (listen(socket_file_descriptor, 5) == -1)
    {
        perror("listen");
        std::cerr << "Error listening on socket" << std::endl;
        return -1;
    }
    return socket_file_descriptor;
}

Value listen_to_wayland_socket_js(const CallbackInfo &info)
{
    auto socket_name = info[0].As<String>().Utf8Value();
    auto socket_file_descriptor = listen_to_wayland_socket(socket_name);
    if (socket_file_descriptor < 0)
    {
        return info.Env().Null();
    }
    return Number::New(info.Env(), socket_file_descriptor);
}