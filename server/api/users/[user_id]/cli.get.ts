import { defaultAiModelDomain } from '~/lib/types/models/ai'

export default defineEventHandler(async (event) => {
  const sessionState = await requireUserSession(event)

  const session = getCookie(event, 'neptun-session')
  const user = sessionState.user
  const userId = user.id
  const email = user.primary_email
  const oauth = user.oauth

  // const host = getHeader(event, 'host'); // 'x-forwarded-for' => 127.0.0.1
  // let protocol = getHeader(event, 'x-forwarded-proto') || 'http';
  // `${protocol}://${host}:42124`
  const requestHost = getRequestHost(event)
  const url = process.env.NODE_ENV === 'production'
    ? `https://${requestHost}`
    : `http://${requestHost}`

  const CLI_CONFIGURATION = {
    utils: {
      neptun_api_server_host: `${url}/api`,
      neptun_github_app_url:
        'https://github.com/apps/neptun-github-app/installations/new',
    },
    auth: {
      neptun_session_cookie: session,
      user: {
        id: userId,
        email,
        oauth,
      },
    },
    active_chat: {
      chat_id: -1,
      chat_name: `chat-${Date.now()}`,
      model: defaultAiModelDomain,
    },
  }

  return CLI_CONFIGURATION
})
