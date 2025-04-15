import { createHighlighter, createJavaScriptRegexEngine, type Highlighter } from 'shiki'

let highlighterInstance: Highlighter | null = null
let highlighterPromise: Promise<Highlighter> | null = null

export function useShikiHighlighter() {
  const isLoading = useState("shiki-is-loading", () => false)
  const error = useState<Error | null>("shiki-error", () => null)

  const getHighlighter = async (): Promise<Highlighter> => {
    if (highlighterInstance) {
      return highlighterInstance
    }

    if (highlighterPromise) {
      return highlighterPromise
    }

    isLoading.value = true
    error.value = null

    highlighterPromise = createHighlighter({
      langs: supportedShikiLanguages,
      themes: [
        'github-light', 'light-plus', 'min-light', 'one-light', 'slack-ochin', 'snazzy-light', 'vitesse-light',
        'github-dark', 'dark-plus', 'min-dark', 'one-dark-pro', 'slack-dark', 'andromeeda', 'vitesse-dark',
      ],
      engine: createJavaScriptRegexEngine()
    })
      .then(highlighter => {
        highlighterInstance = highlighter
        isLoading.value = false
        return highlighter
      })
      .catch(err => {
        error.value = err instanceof Error ? err : new Error(String(err))
        isLoading.value = false
        highlighterPromise = null
        throw err
      })

    return highlighterPromise
  }

  const disposeHighlighter = () => {
    if (highlighterInstance) {
      highlighterInstance.dispose()
      highlighterInstance = null
      highlighterPromise = null
    }
  }

  return {
    getHighlighter,
    disposeHighlighter,
    isLoading,
    error
  }
}
