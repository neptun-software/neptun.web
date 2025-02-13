export function getSanitizedMessageContent(content: string) {
  if (!content || content.trim() === '') {
    return ''
  }

  let sanitizedContent = content

  // Remove any existing details/summary tags first
  sanitizedContent = sanitizedContent.replace(/<\/?(?:details|summary)[^>]*>/g, '')

  // Handle thinking pattern
  if (sanitizedContent.includes('</think>') || sanitizedContent.includes('<think>')) {
    // Add missing start tag if needed
    if (!sanitizedContent.includes('<think>') && sanitizedContent.includes('</think>')) {
      sanitizedContent = '<think>' + sanitizedContent
    }
    if (sanitizedContent.includes('<think>') && !sanitizedContent.includes('</think>')) {
      sanitizedContent += '</think>'
    }

    const thinkMatch = /<think>([\s\S]*?)<\/think>/g.exec(sanitizedContent)
    if (thinkMatch && thinkMatch[1].trim()) {
      const thinkContent = thinkMatch[1].trim()
      // Remove the matched think block from the content
      sanitizedContent = sanitizedContent.replace(/<think>[\s\S]*?<\/think>/, '')
      
      // Only wrap in details if not already wrapped
      if (!thinkContent.startsWith('<details>')) {
        sanitizedContent = `<details>
<summary>AI Thinking Process</summary>
${thinkContent}
</details>

${sanitizedContent.trim()}`
      } else {
        // If already wrapped in details, just prepend it
        sanitizedContent = `${thinkContent}

${sanitizedContent.trim()}`
      }
    } else {
      // No valid think content, remove the tags
      sanitizedContent = sanitizedContent.replace(/<\/?think>/g, '')
    }
  }

  const modelTags = [
    // Model tags with exact patterns
    /<\|im_end\|>/g,
    /\|im_end\|?/g,
    /<\|end\|>/g,
    /<\|assistant\|>/g,
    /<\|user\|>/g,
    /<\|system\|>/g,
    /<\|start_header_id\|>.*?<\|end_header_id\|>/g,
    /<\|begin_of_text\|>/g,
    /<\|eot_id\|>/g,
    /<\|.*?\|>/g,
    /<｜end▁of▁sentence｜>/g,

    // Gemma tags
    /<bos>/g,
    /<eos>/g,
    /<start_of_turn>/g,
    /<end_of_turn>/g,

    // Instruction tags
    /\[INST\]/g,
    /\[\/INST\]/g,
    /<\/s>/g,
  ]

  modelTags.forEach((pattern) => {
    sanitizedContent = sanitizedContent.replace(pattern, '')
  })

  // Clean up whitespace while preserving newlines and indentation
  sanitizedContent = sanitizedContent
    // Remove any zero-width spaces that might appear in streams
    .replace(/\u200B/g, ' ')
    // Normalize other whitespace characters but preserve newlines
    .replace(/[\u2028\u2029\v\f\u0085]/g, '\n')
    // Clean up excessive newlines (more than 2)
    .replace(/\n{3,}/g, '\n\n')

  return sanitizedContent
}
