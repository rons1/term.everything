#include "init_draw_state.h"

#include "Draw_State.h"

Value init_draw_state_js(const CallbackInfo &info)
{
  auto env = info.Env();

  auto session_type_is_x11 = info[0].As<Boolean>().Value();

  auto draw_state = External<Draw_State>::New(
      env, new Draw_State(session_type_is_x11),
      [](Napi::Env env, Draw_State *data)
      { delete data; });
  return draw_state;
}
