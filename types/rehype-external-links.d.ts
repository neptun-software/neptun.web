// https://github.com/rehypejs/rehype-external-links/blob/main/readme.md

declare module '@nuxtjs/mdc' {
  import type { Element, ElementContent, Properties } from 'hast'

  type Target = '_blank' | '_parent' | '_self' | '_top'
  type Test = import('hast-util-is-element').Test

  interface CreateContent {
    (element: Element): Array<ElementContent> | ElementContent | null | undefined
  }

  interface CreateProperties {
    (element: Element): Properties | null | undefined
  }

  interface CreateRel {
    (element: Element): Array<string> | string | null | undefined
  }

  interface CreateTarget {
    (element: Element): Target | null | undefined
  }

  interface Options {
    content?: Array<ElementContent> | CreateContent | ElementContent | null
    contentProperties?: CreateProperties | Properties | null
    properties?: CreateProperties | Properties | null
    protocols?: Array<string> | null
    rel?: Array<string> | CreateRel | string | null
    target?: CreateTarget | Target | null
    test?: Test | null
  }

  interface UnistPlugin {
    'rehype-external-links': Options
  }
}
