import { UserSignUpSchema } from '~/lib/validation/user'
import {
  createUser,
  readUserUsingPrimaryEmail,
} from '~/server/database/repositories/users'

export default defineEventHandler(async (event) => {
  /* 0. CHECK IF USER IS ALREADY LOGGED IN */
  const currentSession = await getUserSession(event)
  if (LOG_BACKEND) {
    console.info('current session', JSON.stringify(currentSession))
  }

  // Check for valid session with user
  if (currentSession?.user?.id) {
    if (LOG_BACKEND) {
      console.warn('attempt to signup while already logged in')
    }
    return sendError(
      event,
      createError({
        statusCode: 403,
        statusMessage: 'Forbidden',
        message: 'Please log out before creating a new account',
      }),
    )
  }

  /* 1. VALIDATE INPUT */
  const result = await readValidatedBody(event, (body) => {
    return UserSignUpSchema.safeParse(body)
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

  /* 2. CHECK IF USER EXISTS */
  const userExists = await readUserUsingPrimaryEmail(email)
  if (LOG_BACKEND) {
    console.info('userExists:', userExists)
  }

  if (userExists) {
    if (LOG_BACKEND) {
      console.warn('user already exists')
    }
    return sendError(
      event,
      createError({
        statusCode: 409,
        statusMessage: 'Conflict',
        message: 'A user with this email already exists',
      }),
    )
  }

  /* 3. CREATE NEW USER */
  const userToCreate = {
    primary_email: email,
    password,
  }

  const createdUser = await createUser(userToCreate)

  if (!createdUser) {
    if (LOG_BACKEND) {
      console.warn('failed to create user')
    }
    return sendError(
      event,
      createError({
        statusCode: 500,
        statusMessage: 'Internal Server Error',
        message: 'Failed to create user account',
      }),
    )
  }

  /* 4. ENSURE CLEAN SESSION STATE */
  // Clear any existing partial session data
  if (Object.keys(currentSession).length !== 0) {
    if (LOG_BACKEND) {
      console.info('clearing partial session')
    }
    await clearUserSession(event)
  }

  /* 5. CREATE NEW SESSION */
  if (LOG_BACKEND) {
    console.info('setting new session')
  }

  const user = {
    id: createdUser.id,
    primary_email: createdUser.primary_email,
  }
  const loggedInAt = new Date()

  return setUserSession(event, {
    user,
    loggedInAt,
  })
})
