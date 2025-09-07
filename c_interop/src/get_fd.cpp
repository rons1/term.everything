#include "get_fd.h"

#include <sys/types.h>
#include <sys/stat.h>
#include <fcntl.h>

#include <sys/types.h>
#include <unistd.h>

Value get_fd_js(const CallbackInfo &info)
{
    auto file_path = info[0].As<String>().Utf8Value();
    auto flags = info[1].As<Number>().Int32Value();
    auto fd = open(file_path.c_str(), flags);
    if (fd == -1)
    {
        perror("get_fd_js");
        return info.Env().Null();
    }
    auto size = lseek(fd, 0, SEEK_END);
    lseek(fd, 0, SEEK_SET);
    auto obj = Object::New(info.Env());
    obj.Set("fd", Number::New(info.Env(), fd));
    obj.Set("size", Number::New(info.Env(), size));
    return obj;
}
