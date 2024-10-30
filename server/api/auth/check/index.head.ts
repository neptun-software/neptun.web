export default defineEventHandler(async (event) => {
  await requireUserSession(event);
  return null;
});
