import MarkdownIt from 'markdown-it'
import Shiki from '@shikijs/markdown-it'

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true
})

function customCodeBlockPlugin(md: MarkdownIt) {
  md.renderer.rules.fence = (tokens: any[], idx: number, options: any, env: any, slf: any) => {
    const token = tokens[idx]
    const language = token.info.trim() || 'text'
    const content = token.content

    return `<div class="code-block-placeholder" data-language="${language}" data-content="${encodeURIComponent(content)}">
      <pre class="fallback-code" style="background: none"><code class="language-${language}">${content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>
    </div>`
  }
}

md.disable(['image'])
md.use(customCodeBlockPlugin)

Shiki({
  themes: {
    light: 'github-light',
    dark: 'github-dark',
  },
}).then(shiki => {
  md.use(shiki)
  self.postMessage({ action: 'ready' })
})

self.onmessage = (event) => {
  const { markdown, isDarkMode } = event.data
  
  try {
    const html = md.render(markdown || '')
    
    self.postMessage({
      html,
      success: true
    })
  } catch (error) {
    self.postMessage({
      error: String(error),
      success: false
    })
  }
}
