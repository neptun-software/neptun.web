export default defineEventHandler(async (event) => {
  const session = await getUserSession(event);
  if (LOG_BACKEND) console.info('current session', JSON.stringify(session));

  if (Object.keys(session).length !== 0) {
    if (LOG_BACKEND) console.info('clearing session...');

    return await clearUserSession(event);
  }

  if (LOG_BACKEND) console.info('no active session to clear...');
  return false;
});
