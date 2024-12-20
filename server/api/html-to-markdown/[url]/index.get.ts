import rehypeExternalLinks from 'rehype-external-links'
import rehypeParse from 'rehype-parse' // parse HTML
import rehypeRemark from 'rehype-remark' // HTML => Markdown
import rehypeSanitize from 'rehype-sanitize'
import remarkFlexibleCodeTitles from 'remark-flexible-code-titles'
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
    .then(async (res) => {
      return res.text()
    })
    .then(async (html) => {
      let markdown

      try {
        const file = await unified()
          .use(rehypeParse, { emitParseErrors: false })
          .use(rehypeSanitize)
          .use(rehypeExternalLinks, { target: '_blank', rel: ['nofollow', 'noopener', 'noreferrer'] })
          .use(rehypeRemark)
          .use(remarkGfm)
          .use(remarkFlexibleCodeTitles)
          .use(remarkStringify)
          .process(html)

        markdown = String(file)
      } catch (error) {
        const errorMessage = error instanceof Error
          ? error.message
          : 'Unknown Error'

        if (LOG_BACKEND) {
          console.error('Failed to parse HTML:', errorMessage)
        }
        markdown = `Failed to parse HTML: ${errorMessage}`
      }

      return markdown
    })
    .catch((err) => {
      if (LOG_BACKEND) {
        console.error(err)
      }
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
