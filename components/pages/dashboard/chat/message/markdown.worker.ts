import MarkdownIt from 'markdown-it'

self.postMessage({ action: 'ready' })

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

self.onmessage = (event) => {
  const { markdown, isDarkMode } = event.data
  
  try {
    console.log('Worker: Rendering markdown...')
    const html = md.render(markdown || '')
    console.log('Worker: Markdown rendered')
    
    self.postMessage({
      html,
      success: true,
    })
  } catch (error) {
    console.error('Worker: Error rendering markdown:', error)
    
    self.postMessage({
      error: String(error),
      success: false,
    })
  }
}
