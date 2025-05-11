import Shiki from '@shikijs/markdown-it'
import MarkdownIt from 'markdown-it'

console.log('Markdown worker initializing...')

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
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
console.log('Markdown initialized, loading Shiki...')

// set a timeout to make sure we eventually send 'ready' even if Shiki fails
const timeoutId = setTimeout(() => {
  console.log('Shiki load timed out, sending ready anyway')
  self.postMessage({ action: 'ready' })
}, 3000)

Shiki({
  themes: {
    light: 'github-light',
    dark: 'github-dark',
  },
}).then((shiki) => {
  clearTimeout(timeoutId)
  console.log('Shiki loaded, initializing...')
  md.use(shiki)
  console.log('Sending ready message...')
  self.postMessage({ action: 'ready' })
}).catch(error => {
  clearTimeout(timeoutId)
  console.error('Error loading Shiki:', error)
  // send ready anyway so we can at least render without syntax highlighting
  self.postMessage({ action: 'ready' })
})

self.onmessage = (event) => {
  console.log('Worker received message:', event.data)
  const { markdown, isDarkMode } = event.data

  try {
    console.log('Rendering markdown...')
    const html = md.render(markdown || '')
    console.log('Markdown rendered, sending HTML back')

    self.postMessage({
      html,
      success: true,
    })
  } catch (error) {
    console.error('Error rendering markdown:', error)
    self.postMessage({
      error: String(error),
      success: false,
    })
  }
}
