import { createOauthAccount } from '~/server/database/repositories/oauthAccounts'

export default oauthGitHubEventHandler({
  config: {
    emailRequired: true,
  },
  async onSuccess(event, { user }) {
    // eslint-disable-next-line ts/no-unsafe-member-access
    const user_email = user?.email // maybe add login (for username), gravatar_id or avatar_url for icon, name, location (for i18n)
    // eslint-disable-next-line ts/no-unsafe-member-access
    const user_id = String(user?.id)

    const createdOrFetchedUserAndConnectedOauthAccount
      = await createOauthAccount({
        provider: 'github',
        oauth_user_id: user_id,
        oauth_email: user_email,
      })

    if (!createdOrFetchedUserAndConnectedOauthAccount) {
      return sendError(
        event,
        createError({
          statusCode: 500,
          statusMessage: 'Failed to create oauth account',
        }),
      )
    }

    if (createdOrFetchedUserAndConnectedOauthAccount.isNewOauthAccount) {
      if (LOG_BACKEND) {
        console.info('New oAuth account created!')
      }
    } else {
      if (LOG_BACKEND) {
        console.info('Fetched existing oAuth account!')
      }
    }

    await setUserSession(event, {
      user: {
        id: createdOrFetchedUserAndConnectedOauthAccount.userData.neptun_user
          .id,
        primary_email:
          createdOrFetchedUserAndConnectedOauthAccount.userData.neptun_user
            .primary_email,
        oauth: {
          github: {
            github_id:
              createdOrFetchedUserAndConnectedOauthAccount.userData
                .oauth_user_id,
            github_email:
              createdOrFetchedUserAndConnectedOauthAccount.userData.oauth_email,
          },
        },
      },
      loggedInAt: new Date(),
    })

    return sendRedirect(event, '/dashboard')
  },
})
