import rehypeParse from 'rehype-parse' // parse HTML
import rehypeRemark from 'rehype-remark' // HTML => Markdown
import remarkGfm from 'remark-gfm' // support for GitHub Flavored Markdown
import remarkStringify from 'remark-stringify' // stringify Markdown
import { unified } from 'unified' // HTML and Markdown Utilities

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
  const url = maybeUrl.data.url

  const markdown = await fetch(url)
    .then((res) => {
      return res.text()
    })
    .then(async (html) => {
      let markdown

      try {
        const file = await unified()
          .use(rehypeParse, { emitParseErrors: false })
          .use(rehypeRemark)
          .use(remarkGfm)
          .use(remarkStringify)
          .process(html)

        markdown = String(file)
      }
      catch (error: any) {
        if (LOG_BACKEND)
          console.error('Failed to parse HTML:', error?.message)
        markdown = `Failed to parse HTML: ${error?.message}`
      }

      return markdown
    })
    .catch((err) => {
      if (LOG_BACKEND)
        console.error(err)
      return 'FAILED'
    })

  if (markdown === 'FAILED') {
    return sendError(
      event,
      createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        data: markdown,
      }),
    )
  }

  return markdown
})
