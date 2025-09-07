#include "Send_Message_And_File_Descriptors.h"

#include <sys/socket.h>

using namespace Napi;

/**
 * @brief
 *
 * @param clientSocket
 * @param buf
 * @param buf_len
 * @param fds
 * @param num_fds
 * @param bytes_written
 * @return true if we should continue to send to this socket
 * @return false if this socket has closed
 */
bool send_message_and_file_descriptors(
    int clientSocket,
    uint8_t *buf,
    size_t buf_len,
    int *fds,
    int num_fds,
    ssize_t *bytes_written)
{
    struct msghdr msg = {0};
    struct iovec iov;
    char cmsgbuf[CMSG_SPACE(sizeof(int) * num_fds)];
    struct cmsghdr *cmsg;

    // Set up the iovec structure
    iov.iov_base = buf;
    iov.iov_len = buf_len;

    // Set up the msghdr structure
    msg.msg_iov = &iov;
    msg.msg_iovlen = 1;
    msg.msg_control = cmsgbuf;
    msg.msg_controllen = sizeof(cmsgbuf);

    // Set up the control message header
    cmsg = CMSG_FIRSTHDR(&msg);
    cmsg->cmsg_level = SOL_SOCKET;
    cmsg->cmsg_type = SCM_RIGHTS;
    cmsg->cmsg_len = CMSG_LEN(sizeof(int) * num_fds);
    // if (num_fds > 0)
    // {
    //     printf("Going to sends fds %d\n", fds[0]);
    // }

    // Copy the file descriptors into the control message
    memcpy(CMSG_DATA(cmsg), fds, sizeof(int) * num_fds);

    // Send the message
    ssize_t n = sendmsg(clientSocket, &msg, 0);
    if (n == -1)
    {
        *bytes_written = 0;
        // if (errno == EPIPE)
        // {
        //     return false;
        // }
        perror("sendmsg");
        // printf("gaaaa");

        // exit(1);
        return false;
    }
    *bytes_written = n;
    return true;
    // return n;
}

class WaylandSendFileDescriptorsListener : public AsyncWorker
{
public:
    int client_socket;
    uint8_t *buf;
    size_t buf_len;
    int *fds;
    int num_fds;

    ssize_t num_bytes_sent = 0;
    bool should_continue = true;

    WaylandSendFileDescriptorsListener(Function &callback, int client_socket, uint8_t *buf, size_t buf_len, int *fds, int num_fds)
        : AsyncWorker(callback), client_socket(client_socket), buf(buf), buf_len(buf_len), fds(fds), num_fds(num_fds)
    {
    }

    void Execute()
    {
        should_continue = send_message_and_file_descriptors(client_socket, buf, buf_len, fds, num_fds, &num_bytes_sent);
    }

    void OnOK()
    {
        Callback().Call({Env().Null(),
                         Boolean::New(Env(), should_continue),
                         Number::New(Env(), num_bytes_sent)});
    }
};

Value send_message_and_file_descriptors_js(const CallbackInfo &info)
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

    auto listener = new WaylandSendFileDescriptorsListener(callback,
                                                           client_socket,
                                                           buffer_bytes,
                                                           buffer.ByteLength(),
                                                           file_descriptor_buffer_with_offset,
                                                           file_descriptor_buffer.ElementLength());

    listener->Queue();
    return info.Env().Undefined();
}
