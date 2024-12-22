export function getSanitizedMessageContent(content: string) {
  const filteredMessage = content
    .replace(/<\|start_header_id\|>[\s\S]*?<\|end_header_id\|>/g, '')
    .replace(/<\|begin_of_text\|>\n/g, '')
    .replace(/<\|eot_id\|>/g, '')
  return filteredMessage.trim()
}
