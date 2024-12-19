export const IS_DEV = import.meta.dev
export const IS_PRERENDER = import.meta.prerender ?? false
export const IS_CLIENT = import.meta.client // import.meta.browser
export const IS_SERVER = import.meta.server // import.meta.nitro

// useNuxtApp().$config and process.env are only available on server side, that is why LOG_FRONTEND is defined as a composable (useLogger()), which uses consola
// export let LOG_FRONTEND = JSON.parse(process.env.LOG_FRONTEND ?? 'false');

if (IS_DEV) {
  console.info(
    `IS_DEV: ${IS_DEV} \nLOG_FRONTEND: ${'useLogger()'} \nIS_PRERENDER: ${IS_PRERENDER} \nIS_CLIENT: ${IS_CLIENT} \nIS_SERVER: ${IS_SERVER}`,
  )
}
