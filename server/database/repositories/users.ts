import { randomUUID } from 'node:crypto'
import { and, eq, like, sql } from 'drizzle-orm'
import {
  type GetUser,
  neptun_user,
  neptun_user_oauth_account,
  type ReadOauthAccount,
  type ReadUser,
  type UserToCreate,
} from '../../../lib/types/database.tables/schema'

export async function validateUserCredentials(email: ReadUser['primary_email'], password: GetUser['hashed_password']) {
  /* TODO: allow more than one email */
  const fetchedUser = await db
    .select({
      id: neptun_user.id,
      primary_email: decryptColumn(neptun_user.primary_email),
    })
    .from(neptun_user)
    .where(
      and(
        like(neptun_user.primary_email, encryptColumn(email)), // SELECT decrypt('\x2866794d48ffaaef22d27652555382a77dfce3e6b71b8fcb3c18ee1a5e6a466a'::bytea, 'secret', 'aes') LIKE 'e.mail@example.com' AS decrypted_primary_email; --check (\x<hex>)
        like(
          neptun_user.hashed_password,
          compareWithSecret(password, neptun_user.hashed_password),
        ), // SELECT crypt('password', '$2a$12$rUibDTAV38yIModD5ufgmOnlpy89Syof3sU0QitE9J.aKdKtwH3IC') LIKE '$2a$12$rUibDTAV38yIModD5ufgmOnlpy89Syof3sU0QitE9J.aKdKtwH3IC' AS password_is_correct; --check
      ),
    )
    .limit(1)
    .catch((err) => {
      if (LOG_BACKEND) {
        console.error('Failed to fetch user from database:', err)
      }
      return null
    })

  if (!fetchedUser) {
    return null
  }

  return fetchedUser[0]
}

export async function createUser(user: UserToCreate) {
  /* TODO: only allow, if email is verified via email code => needs extended login flow */
  const createdUser = await db
    .insert(neptun_user)
    .values({
      primary_email: encryptColumn(user.primary_email), // SELECT encode(encrypt('e.mail@example.com', 'secret', 'aes'), 'hex') AS encrypted_primary_email; --encrypt
      hashed_password: encryptSecret(user.password), // SELECT crypt('password', gen_salt('bf', 12)) AS hashed_password; --encrypt
    })
    // @ts-expect-error (is allowed, just not properly typed)
    .returning({
      id: neptun_user.id,
      primary_email: decryptColumn(
        neptun_user.primary_email,
      ) /* decode(${neptun_user.primary_email}, 'hex') instead of ('\x' || ${neptun_user.primary_email}) instead of concat('\x', ${neptun_user.primary_email}) */,
    })
    .catch((err) => {
      if (LOG_BACKEND) {
        console.error('Failed to insert user into database', err)
      }
      return null
    })

  if (!createdUser) {
    return null
  }
  return createdUser[0]
}

// Needed for Oauth, if no user exists yet.
export async function createEmptyUser() {
  const createdUser = await db
    .insert(neptun_user)
    .values({
      primary_email: encryptColumn(
        `${randomUUID()}@account.oAuth`,
      ) /* TODO: do not allow login with email and password, if email and password are placeholders */,
      hashed_password: encryptSecret('NONE'),
    })
    // @ts-expect-error (is allowed, just not properly typed)
    .returning({
      id: neptun_user.id,
      primary_email: decryptColumn(neptun_user.primary_email),
    })
    .catch((err) => {
      if (LOG_BACKEND) {
        console.error('Failed to insert user into database', err)
      }
      return null
    })

  if (!createdUser) {
    return null
  }
  return createdUser[0]
}

export async function readUserUsingPrimaryEmail(email: ReadUser['primary_email']) {
  /* TODO: Improve, so that other emails are checked too */
  const fetchedUser = await db
    .select({
      id: neptun_user.id,
      primary_email: decryptColumn(neptun_user.primary_email),
    })
    .from(neptun_user)
    .where(like(neptun_user.primary_email, encryptColumn(email)))
    .catch((err) => {
      if (LOG_BACKEND) {
        console.error('Failed to fetch user from database', err)
      }
      return null
    })

  if (!fetchedUser) {
    return null
  }

  return fetchedUser[0] // [][0] => undefined :)
}

export async function readUserIdsOfPrimaryEmails(emails: ReadUser['primary_email'][]) {
  /* const encryptedEmails = emails.map(email => sql.join([sql`(SELECT `, encryptColumn(email), sql` AS TEXT)`]));
  const fetchedUsers = await db.execute<ReadChatConversationShare>(sql`SELECT "id" FROM "neptun_user" WHERE "neptun_user"."primary_email" IN (${sql.join(encryptedEmails, sql`, `)})`);
    return (fetchedUsers as ReadChatConversationShare[]).map(({ id }) => {
    return {
      id
    }
  }); */

  /* const encryptedEmails = emails.map(email => sql.join([sql`neptun_user.primary_email = `, encryptColumn(email)]));

  const fetchedUsers = await db
    .select({
      id: neptun_user.id,
    })
    .from(neptun_user)
    .where(sql`${sql.join(encryptedEmails, sql` or `)}`)
    .catch((err) => {
      if (LOG_BACKEND) console.error('Failed to fetch users from database', err);
      return null;
    }) */

  const encryptedEmails = emails.map(email => encryptColumn(email))
  const fetchedUsers = await db
    .select({
      id: neptun_user.id,
    })
    .from(neptun_user)
    .where(
      sql`neptun_user.primary_email IN (${sql.join(encryptedEmails, sql`, `)})`,
    ) // because inArray is not typed correctly
    .catch((err) => {
      if (LOG_BACKEND) {
        console.error('Failed to fetch users from database', err)
      }
      return null
    })

  if (!fetchedUsers) {
    return null
  }

  return fetchedUsers
}

export async function readUserUsingGithubOauthId(github_oauth_id: ReadOauthAccount['oauth_user_id']) {
  const fetchedUser = await db.query.neptun_user_oauth_account.findFirst({
    columns: {},
    where: and(
      eq(
        decryptColumn(neptun_user_oauth_account.oauth_user_id),
        github_oauth_id,
      ),
      eq(neptun_user_oauth_account.provider, 'github'),
    ),
    with: {
      neptun_user: {
        columns: {
          id: true,
        },
      },
    },
  })

  if (!fetchedUser) {
    return null
  }

  return fetchedUser.neptun_user
}

export async function updateUser(id: ReadUser['id'], primary_email: ReadUser['primary_email'] | undefined, password: GetUser['hashed_password'] | undefined) {
  /* TODO: check for old password, before allowing update, only allow email, if verified via email code */

  const updated_primary_email = () => {
    if (!primary_email) {
      return null
    }

    return {
      primary_email: encryptColumn(primary_email),
    }
  }

  const updated_password = () => {
    if (!password) {
      return null
    }

    return {
      hashed_password: encryptSecret(password),
    }
  }

  const updatedUserInformation = {
    ...updated_primary_email(),
    ...updated_password(),
  }

  const updatedUser = await db
    .update(neptun_user)
    .set(updatedUserInformation)
    .where(eq(neptun_user.id, id))
    // @ts-expect-error (is allowed, just not properly typed)
    .returning({
      id: neptun_user.id,
      primary_email: decryptColumn(neptun_user.primary_email),
    })
    .catch((err) => {
      if (LOG_BACKEND) {
        console.error('Failed to update user in database', err)
      }
      return null
    })

  if (!updatedUser) {
    return null
  }

  return updatedUser[0]
}

export async function deleteUser(id: ReadUser['id']) {
  return db
    .delete(neptun_user)
    .where(eq(neptun_user.id, id))
    .then(() => true)
    .catch((err) => {
      if (LOG_BACKEND) {
        console.error('Failed to delete user from database', err)
      }
      return false
    })
}
