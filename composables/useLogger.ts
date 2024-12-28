import consola from 'consola'

export function useLogger() {
  // const { $config } = useNuxtApp(); // not available in composables (same as useRuntimeConfig())
  // const LOG_FRONTEND = $config.public.LOG_FRONTEND;

  // no env-vars available in the frontend
  const LOG_FRONTEND = IS_DEV

  if (!LOG_FRONTEND) {
    consola.pauseLogs()
  } else {
    consola.resumeLogs()
  }

  return {
    console: consola,
  }
}
