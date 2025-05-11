console.log('Markdown worker initializing...')

const initializeMarkdownIt = async () => {
  try {
    const [{ default: MarkdownIt }, { default: Shiki }] = await Promise.all([
      import('markdown-it'),
      import('@shikijs/markdown-it')
    ])

    console.log('Modules loaded, initializing markdown...')
    
    const md = new MarkdownIt({
      html: true,
      linkify: true,
      typographer: true,
    })

    function customCodeBlockPlugin(md: any) {
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

    try {
      console.log('Loading Shiki...')
      const shiki = await Shiki({
        themes: {
          light: 'github-light',
          dark: 'github-dark',
        },
      })
      
      console.log('Shiki loaded, initializing...')
      md.use(shiki)
      console.log('Sending ready message...')
      self.postMessage({ action: 'ready' })
      return md
    } catch (error) {
      console.error('Error loading Shiki:', error)
      // send ready anyway so we can at least render without syntax highlighting
      self.postMessage({ action: 'ready' })
      return md
    }
  } catch (error) {
    console.error('Error initializing markdown:', error)
    self.postMessage({ 
      action: 'ready',
      error: String(error)
    })
    throw error
  }
}

const mdPromise = initializeMarkdownIt()
const timeoutId = setTimeout(() => {
  console.log('Markdown initialization timed out, sending ready anyway')
  self.postMessage({ action: 'ready' })
}, 3000)

self.onmessage = async (event) => {
  console.log('Worker received message:', event.data)
  const { markdown, isDarkMode } = event.data

  try {
    const md = await mdPromise
    clearTimeout(timeoutId)
    
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
