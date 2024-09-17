export default defineEventHandler(async (event) => {
  const sessionState = await requireUserSession(event);

  const session = getCookie(event, 'neptun-session');
  const user = sessionState.user;
  const userId = user.id;
  const email = user.primary_email;
  const oauth = user.oauth;

  // const host = getHeader(event, 'host'); // 'x-forwarded-for' => 127.0.0.1
  // let protocol = getHeader(event, 'x-forwarded-proto') || 'http';
  const url = event.context.siteConfig.get().url;

  const CLI_CONFIGURATION = {
    "utils": {
      "neptun_api_server_host": url // `${protocol}://${host}:443`
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
      "model": "OpenAssistant/oasst-sft-4-pythia-12b-epoch-3.5"
    }
  }

  return CLI_CONFIGURATION;
});
