import type { BundledLanguage } from 'shiki'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import strip from 'strip-markdown'
import remarkStringify from 'remark-stringify'
import { supportedFileExtensionsMap, supportedShikiLanguages } from '~/utils/formatters'

// `remark-code-blocks` doesn't work anymore and writing remark plugins is a pain (spent about 2 hours on it...), that's why I am trying to do this using regex magic
export async function getCodeBlocksFromMarkdown(
  markdown: string
): Promise<CodeBlock[]> {
  // regular expression to match code blocks with optional title and language
  const codeBlockRegex
    = /```(?<language>[a-zA-Z0-9_]+)(?::(?<title>[^\n]*))?\n(?<code>[\s\S]*?)```/g
  const codeBlocks: CodeBlock[] = [];

  let match: RegExpExecArray | null;
  while ((match = codeBlockRegex.exec(markdown)) !== null) {
    const { language, title, code } = match.groups!;

    const validatedLanguage = getValidatedCodeBlockLanguage(
      language
    ) as keyof typeof supportedFileExtensionsMap;
    const fileExtension
      = supportedFileExtensionsMap[validatedLanguage] ?? 'txt';

    codeBlocks.push({
      language: validatedLanguage as string,
      extension: fileExtension,
      title: title ? title.trim() : '',
      text: code.trim()
    })
  }

  return codeBlocks;
}

function getValidatedCodeBlockLanguage(language: string) {
  if (supportedShikiLanguages.includes(language as BundledLanguage)) {
    return language;
  }

  return 'text';
}

interface CodeBlock {
  title: string
  language: string
  extension: string
  text: string
}

export const stripMarkdown = async (markdown: string) => {
  const file = await unified()
    .use(remarkParse)
    .use(strip)
    .use(remarkStringify)
    .process(markdown);

  return String(file);
}
