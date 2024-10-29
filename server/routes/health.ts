export default defineEventHandler(async (event) => {
  const healthCheck = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  };

  return healthCheck;
});
