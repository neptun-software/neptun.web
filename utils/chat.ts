export function getSanitizedMessageContent(content: string) {
  if (!content || content.trim() === '') {
    return ''
  }

  let sanitizedContent = content

  // Common model markers and tags to remove
  const tagPatterns = [
    // Meta Llama tags
    /<\|begin_of_text\|>/g,
    /<\|start_header_id\|>.*?<\|end_header_id\|>/g,
    /<\|eot_id\|>/g,

    // Gemma tags
    /<bos>/g,
    /<start_of_turn>.*\n/g,
    /<end_of_turn>/g,

    // Phi tags
    /<\|system\|>\n/g,
    /<\|user\|>\n/g,
    /<\|assistant\|>\n/g,
    /<\|end\|>/g,

    // Qwen and Mistral tags
    /<\|im_start\|>.*\n/g,
    /<\|im_end\|>/g,
    /\[INST\]/g,
    /\[\/INST\]/g,
    /<\/s>/g,

    // Remove any other model-specific tags that might appear
    /<\|.*?\|>/g,
  ]

  // Apply all tag patterns
  tagPatterns.forEach((pattern) => {
    sanitizedContent = sanitizedContent.replace(pattern, '')
  })

  // Handle incomplete or malformed tags in streaming chunks
  sanitizedContent = sanitizedContent
    // Remove incomplete tags at the start of a chunk
    .replace(/^[^<]*>/g, '')
    // Remove incomplete tags at the end of a chunk
    .replace(/<[^>]*$/g, '')
    // Remove any remaining malformed tags
    .replace(/<[^>]*>/g, '')
    // Remove any leftover square brackets from instruction tags
    .replace(/\[(?![\w\s]*\])|(?<!\[[\w\s]*)\]/g, '')

  // Clean up whitespace
  sanitizedContent = sanitizedContent
    // Replace multiple newlines with double newlines
    .replace(/\n{3,}/g, '\n\n')
    // Remove leading/trailing whitespace
    .trim()
    // Remove any zero-width spaces that might appear in streams
    .replace(/\u200B/g, '')
    // Normalize other whitespace characters
    .replace(/[\u2028\u2029\v\f\u0085]/g, ' ')

  return sanitizedContent
}
