export function getSanitizedMessageContent(content: string) {
  if (!content) return ''
  
  return content
    .replace(/<\|.*?\|>.*?<\|.*?\|>\n\n/g, '') // removes <\|any_text\|>any_text<\|any_text\|>
    .trim()
}
