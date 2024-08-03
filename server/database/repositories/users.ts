import { generateUUID } from '~/lib/utils';
import {
  chat_user,
  type GetUser,
  type ReadUser,
  type UserToCreate,
} from '../../../lib/types/database.tables/schema';
import { and, eq, like } from 'drizzle-orm';

export const validateUserCredentials = async (
  email: ReadUser['primary_email'],
  password: GetUser['hashed_password']
) => {
  /* TODO: allow more than one email */
  const fetchedUser = await db
    .select({
      id: chat_user.id,
      primary_email: decryptColumn(chat_user.primary_email),
    })
    .from(chat_user)
    .where(
      and(
        like(chat_user.primary_email, encryptColumn(email)), // SELECT decrypt('\x2866794d48ffaaef22d27652555382a77dfce3e6b71b8fcb3c18ee1a5e6a466a'::bytea, 'secret', 'aes') LIKE 'e.mail@example.com' AS decrypted_primary_email; --check (\x<hex>)
        like(
          chat_user.hashed_password,
          compareWithSecret(password, chat_user.hashed_password)
        ) // SELECT crypt('password', '$2a$12$rUibDTAV38yIModD5ufgmOnlpy89Syof3sU0QitE9J.aKdKtwH3IC') LIKE '$2a$12$rUibDTAV38yIModD5ufgmOnlpy89Syof3sU0QitE9J.aKdKtwH3IC' AS password_is_correct; --check
      )
    )
    .limit(1)
    .catch((err) => {
      if (LOG_BACKEND)
        console.error('Failed to fetch user from database:', err);
      return null;
    });

  if (!fetchedUser) return null;

  return fetchedUser[0];
};

export const createUser = async (user: UserToCreate) => {
  /* TODO: only allow, if email is verified via email code => needs extended login flow */
  const createdUser = await db
    .insert(chat_user)
    .values({
      primary_email: encryptColumn(user.primary_email), // SELECT encode(encrypt('e.mail@example.com', 'secret', 'aes'), 'hex') AS encrypted_primary_email; --encrypt
      hashed_password: encryptSecret(user.password), // SELECT crypt('password', gen_salt('bf', 12)) AS hashed_password; --encrypt
    })
    // @ts-ignore (is allowed, just not properly typed)
    .returning({
      id: chat_user.id,
      primary_email: decryptColumn(
        chat_user.primary_email
      ) /* decode(${chat_user.primary_email}, 'hex') instead of ('\x' || ${chat_user.primary_email}) instead of concat('\x', ${chat_user.primary_email}) */,
    })
    .catch((err) => {
      if (LOG_BACKEND)
        console.error('Failed to insert user into database', err);
      return null;
    });

  if (!createdUser) return null;
  return createdUser[0];
};

// Needed for Oauth, if no user exists yet.
export const createEmptyUser = async () => {
  const createdUser = await db
    .insert(chat_user)
    .values({
      primary_email: encryptColumn(
        `${generateUUID()}@account.oAuth`
      ) /* TODO: do not allow login with email and password, if email and password are placeholders */,
      hashed_password: encryptSecret('NONE'),
    })
    // @ts-ignore (is allowed, just not properly typed)
    .returning({
      id: chat_user.id,
      primary_email: decryptColumn(chat_user.primary_email),
    })
    .catch((err) => {
      if (LOG_BACKEND)
        console.error('Failed to insert user into database', err);
      return null;
    });

  if (!createdUser) return null;
  return createdUser[0];
};

export const readUserUsingPrimaryEmail = async (
  email: ReadUser['primary_email']
) => {
  /* TODO: Improve, so that other emails are checked too */
  const fetchedUser = await db
    .select({
      id: chat_user.id,
      primary_email: decryptColumn(chat_user.primary_email),
    })
    .from(chat_user)
    .where(like(chat_user.primary_email, encryptColumn(email)))
    .catch((err) => {
      if (LOG_BACKEND) console.error('Failed to fetch user from database', err);
      return null;
    });

  if (!fetchedUser) return null;

  return fetchedUser[0]; // [][0] => undefined :)
};

export const updateUser = async (
  id: ReadUser['id'],
  primary_email: ReadUser['primary_email'] | undefined,
  password: GetUser['hashed_password'] | undefined
) => {
  /* TODO: check for old password, before allowing update, only allow email, if verified via email code */

  const updated_primary_email = () => {
    if (!primary_email) return null;

    return {
      primary_email: encryptColumn(primary_email),
    };
  };

  const updated_password = () => {
    if (!password) return null;

    return {
      hashed_password: encryptSecret(password),
    };
  };

  const updatedUserInformation = {
    ...updated_primary_email(),
    ...updated_password(),
  };

  const updatedUser = await db
    .update(chat_user)
    .set(updatedUserInformation)
    .where(eq(chat_user.id, id))
    // @ts-ignore (is allowed, just not properly typed)
    .returning({
      id: chat_user.id,
      primary_email: decryptColumn(chat_user.primary_email),
    })
    .catch((err) => {
      if (LOG_BACKEND) console.error('Failed to update user in database', err);
      return null;
    });

  if (!updatedUser) return null;

  return updatedUser[0];
};

export const deleteUser = async (id: ReadUser['id']) => {
  return await db
    .delete(chat_user)
    .where(eq(chat_user.id, id))
    .then(() => true)
    .catch((err) => {
      if (LOG_BACKEND)
        console.error('Failed to delete user from database', err);
      return false;
    });
};
