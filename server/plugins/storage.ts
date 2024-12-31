import vercelKVDriver from 'unstorage/drivers/vercel-kv'

export default defineNitroPlugin(() => {
  const storage = useStorage()

  try {
    const driver = vercelKVDriver({
      url: useRuntimeConfig().temporaryStorageConnectionUrl, // db host
      token: useRuntimeConfig().temporaryStorageConnectionToken, // db password
    })

    storage.mount('temporary-storage', driver)
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (LOG_BACKEND) {
        console.error('Error:', error.message)
      }

      throw createError({
        statusCode: 500,
        message: error.message,
      })
    } else {
      if (LOG_BACKEND) {
        console.error('Unknown error!')
      }
      throw createError({
        statusCode: 500,
        message: 'Unknown error',
      })
    }
  }
})
