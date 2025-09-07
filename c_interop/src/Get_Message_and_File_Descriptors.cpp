#include "Get_Message_and_File_Descriptors.h"

#include <cstdlib>
#include <iostream>

#include <unistd.h>

#include <sys/types.h>
#include <sys/socket.h>
#include <sys/un.h>

#include <thread>

#include <napi.h>

/**
 * @brief Get the message and file descriptors object
 *
 * @param clientSocket
 * @param buf
 * @param buf_len
 * @param fds
 * @param num_fds
 * @return true if we should continue the loop
 * @return false if we should stop the loop we are done
 */
bool get_message_and_file_descriptors(
    int clientSocket,
    uint8_t *buf,
    size_t buf_len,
    size_t *num_bytes_received,
    int *fds,
    int *num_fds

)
{
    fd_set file_descriptor_set;

    FD_ZERO(&file_descriptor_set);
    FD_SET(clientSocket, &file_descriptor_set);

    struct timeval tv;

    tv.tv_sec = 0;
    tv.tv_usec = 10000; // 10000 microseconds = 10 millisecond
    // tv.tv_usec = 1; // 10000 microseconds = 10 millisecond

    int retval = select(clientSocket + 1,
                        &file_descriptor_set,
                        NULL,
                        NULL,
                        &tv);

    if (retval == -1)
    {
        perror("select()");
        return false;
    }
    else if (retval == 0)
    {
        // Timeout occured
        //  printf("timeout\n");
        *num_bytes_received = 0;
        *num_fds = 0;
        return true;
    }

    struct msghdr msg = {0};
    struct iovec iov;
    // char buf[1];
    char cmsgbuf[CMSG_SPACE(sizeof(int) * 10)]; // Adjust size as needed
    struct cmsghdr *cmsg;

    // Set up the iovec structure
    iov.iov_base = buf;
    iov.iov_len = buf_len; // sizeof(buf);

    // Set up the msghdr structure
    msg.msg_iov = &iov;
    msg.msg_iovlen = 1;
    msg.msg_control = cmsgbuf;
    msg.msg_controllen = sizeof(cmsgbuf);

    // Peek at the message
    ssize_t n = recvmsg(clientSocket, &msg, 0);
    if (n == -1)
    {
        perror("recvmsg");
        return false;
    }

    int *fdptr;
    int fd_count = 0;

    // Iterate through the control messages
    for (cmsg = CMSG_FIRSTHDR(&msg); cmsg != NULL; cmsg = CMSG_NXTHDR(&msg, cmsg))
    {
        if (cmsg->cmsg_level == SOL_SOCKET && cmsg->cmsg_type == SCM_RIGHTS)
        {
            fdptr = (int *)CMSG_DATA(cmsg);
            int fd_count_in_cmsg = (cmsg->cmsg_len - CMSG_LEN(0)) / sizeof(int);
            for (int i = 0; i < fd_count_in_cmsg; i++)
            {
                fds[fd_count++] = fdptr[i];
                // printf("Received file descriptor: %d\n", fdptr[i]);
                if (fd_count >= 255)
                {
                    break;
                }
            }
        }
    }

    *num_fds = fd_count;
    *num_bytes_received = n;
    if (n == 0)
    {
        // EOF
        // std::cout << "EOF" << std::endl;
        return false;
    }
    if (n < 0)
    {
        perror("recvmsg");
        return false;
    }
    // return n;
    return true;
}

class WaylandGetMessageAndFileDescriptorsListener : public AsyncWorker
{
public:
    int client_socket;
    uint8_t *buf;
    size_t buf_len;
    size_t num_bytes_received = 0;
    int *fds;
    int num_fds = 0;

    bool should_continue = true;

    WaylandGetMessageAndFileDescriptorsListener(Function &callback, int client_socket, uint8_t *buf, size_t buf_len, int *fds)
        : AsyncWorker(callback), client_socket(client_socket), buf(buf), buf_len(buf_len), fds(fds)
    {
    }

    void Execute()
    {
        should_continue = get_message_and_file_descriptors(client_socket, buf, buf_len, &num_bytes_received, fds, &num_fds);
        if (!should_continue)
        {
            close(client_socket);
        }
    }

    void OnOK()
    {
        Callback().Call({Env().Null(),
                         Boolean::New(Env(), should_continue),
                         Number::New(Env(), num_bytes_received),
                         Number::New(Env(), num_fds)});
    }
};

Value get_message_and_file_descriptors_js(const CallbackInfo &info)
{
    auto client_socket = info[0].As<Number>().Int32Value();

    auto buffer = info[1].As<TypedArray>();

    /**
     * @TODO Do I need the ByteOffset here?
     *
     */
    auto buffer_bytes = ((uint8_t *)buffer.ArrayBuffer().Data()) + buffer.ByteOffset();

    auto file_descriptor_buffer = info[2].As<TypedArray>();

    auto file_descriptor_buffer_with_offset = (int *)(((uint8_t *)file_descriptor_buffer.ArrayBuffer().Data()) + buffer.ByteOffset());

    auto callback = info[3].As<Function>();

    auto listener = new WaylandGetMessageAndFileDescriptorsListener(callback,
                                                                    client_socket,
                                                                    buffer_bytes,
                                                                    buffer.ByteLength(),
                                                                    file_descriptor_buffer_with_offset);

    listener->Queue();
    return info.Env().Undefined();
}