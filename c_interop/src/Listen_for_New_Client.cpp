#include "Listen_for_New_Client.h"
#include "Client_State.h"
#include <napi.h>
#include <sys/socket.h>

using namespace Napi;

class WaylandListenForNewClientListener : public AsyncWorker {
public:
  int socket_file_descriptor;
  WaylandListenForNewClientListener(Function &callback,
                                    int socket_file_descriptor)
      : AsyncWorker(callback), socket_file_descriptor(socket_file_descriptor) {}
  int client_socket = -1;

  void Execute() {
    client_socket = accept(socket_file_descriptor, nullptr, nullptr);
  }

  void OnOK() {
    auto client_state = External<ClientState>::New(
        Env(), new ClientState(),
        [](Napi::Env env, ClientState *data) { delete data; });
    Callback().Call({Env().Null(), Number::New(Env(), client_socket), client_state});
  }
};

Value listen_for_client(const CallbackInfo &info) {

  auto socket_file_descriptor = info[0].As<Number>().Int32Value();
  auto callback = info[1].As<Function>();
  auto worker =
      new WaylandListenForNewClientListener(callback, socket_file_descriptor);
  worker->Queue();
  return info.Env().Undefined();
}