import type { OauthAccountToCreate } from '../../../lib/types/database.tables/schema'
import { and, eq } from 'drizzle-orm'
import {
  neptun_user,
  neptun_user_oauth_account,

} from '../../../lib/types/database.tables/schema'
import { createEmptyUser } from './users'

export async function createOauthAccount(account: OauthAccountToCreate) {
  /* TODO: if neptun_user_id user exists, link account to user (use neptun_user_id?) */

  /* CHECK IF OAUTH ACCOUNT ALREADY EXISTS */

  const existingOauthUser = await db.query.neptun_user_oauth_account.findFirst({
    where: and(
      eq(
        neptun_user_oauth_account.provider,
        account.provider,
      ) /* check if oauth account with that provider exists for existing user */,
      eq(
        neptun_user_oauth_account.oauth_user_id,
        encryptColumn(account.oauth_user_id),
      ),
    ),
    with: {
      neptun_user: {
        columns: {
          id: true,
        },
        extras: {
          /* custom fields */
          primary_email: decryptColumn(neptun_user.primary_email).as(
            'primary_email',
          ),
        },
      },
    },
    columns: {
      provider: true,
    },
    extras: {
      oauth_user_id: decryptColumn(neptun_user_oauth_account.oauth_user_id).as(
        'oauth_user_id',
      ),
      oauth_email: decryptColumn(neptun_user_oauth_account.oauth_email).as(
        'oauth_email',
      ),
    },
  })

  if (existingOauthUser) {
    return {
      isNewOauthAccount: false,
      userData: {
        ...existingOauthUser,
      },
    }
  }

  /* CREATE NEW USER AND OAUTH ACCOUNT, IF IT DOESN'T EXIST INSTEAD */

  const createdUser = await createEmptyUser()

  if (!createdUser) {
    return null
  }

  const createdOauthAccount = await db
    .insert(neptun_user_oauth_account)
    .values({
      provider: account.provider /* github, google */,
      oauth_user_id: encryptColumn(
        account.oauth_user_id,
      ) /* id from /auth/github or /auth/google */,
      oauth_email: encryptColumn(
        account.oauth_email,
      ) /* email from /auth/github or /auth/google */,
      neptun_user_id: createdUser.id,
    })
    // @ts-expect-error (is allowed, just not properly typed)
    .returning({
      provider: neptun_user_oauth_account.provider,
      oauth_user_id: decryptColumn(neptun_user_oauth_account.oauth_user_id),
      oauth_email: decryptColumn(neptun_user_oauth_account.oauth_email),
    })
    .catch((err) => {
      if (LOG_BACKEND) {
        console.error('Failed to insert oauth account into database', err)
      }
      return null
    })

  if (!createdOauthAccount) {
    return null
  }

  /* TODO: set primary_email to Oauth Email */

  return {
    isNewOauthAccount: true,
    userData: {
      provider: createdOauthAccount[0].provider,
      oauth_user_id: createdOauthAccount[0].oauth_user_id,
      oauth_email: createdOauthAccount[0].oauth_email,
      neptun_user: {
        id: createdUser.id,
        primary_email: createdUser.primary_email,
      },
    },
  }
}
