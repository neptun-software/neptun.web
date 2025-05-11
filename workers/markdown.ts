import MarkdownIt from 'markdown-it'

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
})

md.renderer.rules.fence = (tokens, idx, options, env, slf) => {
  const token = tokens[idx]
  const language = token.info.trim() || 'text'
  const content = token.content

  return `<div class="code-block-placeholder" data-language="${language}" data-content="${encodeURIComponent(content)}">
    <pre class="fallback-code" style="background: none"><code class="language-${language}">${content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>
  </div>`
}

md.disable(['image'])

export function checkReady() {
  return { action: 'ready' }
}

export function renderMarkdown(markdown: string, isDarkMode: boolean) {
  try {
    console.log('Rendering markdown...')
    const html = md.render(markdown || '')
    console.log('Markdown rendered')
    return {
      html,
      success: true,
    }
  } catch (error) {
    console.error('Error rendering markdown:', error)
    return {
      error: String(error),
      success: false,
    }
  }
}
