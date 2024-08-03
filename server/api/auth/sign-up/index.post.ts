import { UserLogInSchema } from '~/lib/types/input.validation';
import {
  createUser,
  readUserUsingPrimaryEmail,
} from '~/server/database/repositories/users';

export default defineEventHandler(async (event) => {
  /* 0. CHECK IF USER IS ALREADY LOGGED IN => UPDATE SESSION */
  const session = await getUserSession(event);
  if (LOG_BACKEND) console.info('current session', JSON.stringify(session));

  if (Object.keys(session).length !== 0) {
    const loggedInAt = new Date();
    if (LOG_BACKEND) console.info('replacing session');

    return await replaceUserSession(event, {
      user: session.user,
      loggedInAt,
    });
  }

  /* 1. VALIDATE INPUT */
  const result = await readValidatedBody(event, (body) => {
    return UserLogInSchema.safeParse(body);
  });

  if (LOG_BACKEND) console.info('result', JSON.stringify(result));
  if (!result.success || !result.data)
    return sendError(
      event,
      createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        data: result.error,
      })
    );
  const body = result.data!;

  if (LOG_BACKEND) console.info('body', body);

  const { email, password } = body;

  /* 2. CHECK IF USER EXISTS */

  const userExists = await readUserUsingPrimaryEmail(email);
  if (LOG_BACKEND) console.info('userExists:', userExists);

  if (userExists) {
    if (LOG_BACKEND) console.warn('user already exists');
    return sendError(
      event,
      createError({ statusCode: 409, statusMessage: 'Conflict' })
    );
  }

  /* 3. CREATE NEW USER */

  const userToCreate = {
    primary_email: email,
    password,
  };

  const createdUser = await createUser(userToCreate);

  if (!createdUser) {
    if (LOG_BACKEND) console.warn('failed to create user');
    return sendError(
      event,
      createError({ statusCode: 500, statusMessage: 'Internal Server Error' })
    );
  }

  /* 4. CREATE NEW SESSION */

  const user = {
    id: createdUser.id,
    primary_email: createdUser.primary_email,
  };

  const loggedInAt = new Date();
  if (LOG_BACKEND) console.info('setting new session');

  return await setUserSession(event, {
    user,
    loggedInAt,
  });
});
