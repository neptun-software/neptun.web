declare module '@nuxtjs/mdc' {
  interface UnistPlugin {
    'rehype-external-links': {
      rel?: string[]
      target?: string
    }
  }
}
