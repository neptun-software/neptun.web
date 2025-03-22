import ogs from 'open-graph-scraper'

export default defineCachedEventHandler(async (event) => {
  /* VALIDATE PARAMS */
  const maybeUrl = await validateParamUrl(event)
  if (maybeUrl.statusCode !== 200) {
    return sendError(
      event,
      createError({
        statusCode: maybeUrl.statusCode,
        statusMessage: maybeUrl.statusMessage,
        data: maybeUrl.data,
      }),
    )
  }
  const url = maybeUrl.data.url.toString()

  try {
    const { result } = await ogs({
      url,
      timeout: 5000,
      fetchOptions: {
        headers: {
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        },
      },
    })

    return result
  } catch (error) {
    return sendError(
      event,
      createError({
        statusCode: 500,
        message: `Failed to fetch OG data: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }),
    )
  }
})
