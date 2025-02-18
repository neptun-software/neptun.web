import { UserLogInSchema } from '~/lib/validation/user'
import { validateUserCredentials } from '~/server/database/repositories/users'

export default defineEventHandler(async (event) => {
  /* 0. CHECK IF USER IS ALREADY LOGGED IN */
  const currentSession = await getUserSession(event)
  if (LOG_BACKEND) {
    console.info('current session', JSON.stringify(currentSession))
  }

  // Check for valid session with user
  if (currentSession?.user?.id) {
    if (LOG_BACKEND) {
      console.warn('attempt to login while already logged in')
    }
    return sendError(
      event,
      createError({
        statusCode: 403,
        statusMessage: 'Forbidden',
        message: 'Please log out before logging in as a different user',
      }),
    )
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
      createError({
        statusCode: 401,
        statusMessage: 'Unauthorized',
        message: 'Invalid email or password',
      }),
    )
  }

  /* 3. ENSURE CLEAN SESSION STATE */
  // Clear any existing partial session data
  if (Object.keys(currentSession).length !== 0) {
    if (LOG_BACKEND) {
      console.info('clearing partial session')
    }
    await clearUserSession(event)
  }

  /* 4. CREATE NEW SESSION */
  if (LOG_BACKEND) {
    console.info('setting new session')
  }

  const user = {
    id: userIsValid.id,
    primary_email: userIsValid.primary_email,
  }
  const loggedInAt = new Date()

  return setUserSession(event, {
    user,
    loggedInAt,
  })
})
