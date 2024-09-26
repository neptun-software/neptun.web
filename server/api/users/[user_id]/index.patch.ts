import { UserUpdateSchema } from '~/lib/types/input.validation';
import { updateUser } from '~/server/database/repositories/users';

// Update user
export default defineEventHandler(async (event) => {
  /* VALIDATE PARAMS */
  const maybeUserId = await validateParamUserId(event);
  if (maybeUserId.statusCode !== 200) {
    return sendError(
      event,
      createError({
        statusCode: maybeUserId.statusCode,
        statusMessage: maybeUserId.statusMessage,
        data: maybeUserId.data
      })
    );
  }
  const user_id = maybeUserId.data?.user_id;

  /* VALIDATE BODY */
  const body = await readValidatedBody(event, body =>
    UserUpdateSchema.safeParse(body)
  );
  if (!body.success || !body.data) {
    if (LOG_BACKEND) console.log('body.error', body.error);

    return sendError(
      event,
      createError({
        statusCode: 400,
        statusMessage: 'Bad Request.',
        message: 'Invalid body(?email, ?password).',
        data: body.error
      })
    );
  }
  const validatedBody = body.data;
  const { email, password } = validatedBody;

  if (!email && !password) {
    return sendError(
      event,
      createError({
        statusCode: 400,
        statusMessage: 'Bad Request.',
        message:
          'Invalid body(?email, ?password). At least one of email or password is required.'
      })
    );
  }

  /* UPDATE USER */

  const updatedUser = await updateUser(user_id, email, password);

  if (LOG_BACKEND) console.log('updatedUser', updatedUser);

  if (updatedUser) {
    const loggedInAt = new Date();
    const session = await getUserSession(event);

    if (session.user) {
      session.user.primary_email = updatedUser.primary_email;
    }

    await replaceUserSession(event, {
      user: session.user,
      loggedInAt
    })
  }

  return {
    user: updatedUser
  }
});
