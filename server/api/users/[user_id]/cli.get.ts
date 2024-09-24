import { defaultAiModelDomain } from "~/lib/types/ai.models";

export default defineEventHandler(async (event) => {
  const sessionState = await requireUserSession(event);

  const session = getCookie(event, 'neptun-session');
  const user = sessionState.user;
  const userId = user.id;
  const email = user.primary_email;
  const oauth = user.oauth;

  // const host = getHeader(event, 'host'); // 'x-forwarded-for' => 127.0.0.1
  // let protocol = getHeader(event, 'x-forwarded-proto') || 'http';
  // `${protocol}://${host}:42124`
  const url = event.context.siteConfig.get().url;

  const CLI_CONFIGURATION = {
    "utils": {
      "neptun_api_server_host": `${url}api`,
    },
    "auth": {
      "neptun_session_cookie": session,
      "user": {
        "id": userId,
        "email": email,
        "oauth": oauth
      }
    },
    "active_chat": {
      "chat_id": -1,
      "chat_name": `chat-${Date.now()}`,
      "model": defaultAiModelDomain
    }
  }

  return CLI_CONFIGURATION;
});
