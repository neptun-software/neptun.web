export default defineNitroPlugin(() => {
  /**
   * Updates session on fetch.
   */
  sessionHooks.hook('fetch', async (session, event) => {
    const loggedInAt = new Date();
    await replaceUserSession(event, {
      user: session.user,
      loggedInAt,
    });
  });

  /* sessionHooks.hook('clear', async (session, event) => {
    if (LOG_BACKEND) console.info('session cleared...');
  }); */
});
