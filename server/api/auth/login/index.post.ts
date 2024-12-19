import { UserLogInSchema } from '~/lib/types/input.validation'
import { validateUserCredentials } from '~/server/database/repositories/users'

export default defineEventHandler(async (event) => {
  /* 0. CHECK IF USER IS ALREADY LOGGED IN => UPDATE SESSION */
  const session = await getUserSession(event)
  if (LOG_BACKEND) {
    console.info('current session', JSON.stringify(session))
  }

  if (Object.keys(session).length !== 0) {
    const loggedInAt = new Date()
    if (LOG_BACKEND) {
      console.info('replacing session')
    }

    return replaceUserSession(event, {
      user: session.user,
      loggedInAt,
    })
  }

  /* 1. VALIDATE INPUT */
  const result = await readValidatedBody(event, (body) => {
    return UserLogInSchema.safeParse(body)
  })

  if (LOG_BACKEND) {
    console.info('result', JSON.stringify(result))
  }
  if (!result.success || !result.data) {
    return sendError(
      event,
      createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        data: result.error,
      }),
    )
  }
  const body = result.data

  if (LOG_BACKEND) {
    console.info('body', body)
  }

  const { email, password } = body

  /* 2. CHECK IF USER IS VALID */

  const userIsValid = await validateUserCredentials(email, password)
  if (LOG_BACKEND) {
    console.info('userIsValid:', userIsValid)
  }

  if (!userIsValid) {
    if (LOG_BACKEND) {
      console.warn('invalid credentials')
    }
    return sendError(
      event,
      createError({ statusCode: 401, statusMessage: 'Unauthorized' }),
    )
  }

  /* 3. CREATE NEW SESSION */

  const user = {
    id: userIsValid.id,
    primary_email: userIsValid.primary_email,
  }

  const loggedInAt = new Date()
  if (LOG_BACKEND) {
    console.info('setting new session')
  }

  return setUserSession(event, {
    user,
    loggedInAt,
  })
})
