export const getSanitizedMessageContent = (content: string) => {
    const filteredMessage = content.replace(/<\|start_header_id\|>.*?<\|end_header_id\|>\n\n/g, ''); // needed for Llama3
    const trimmedMessage = filteredMessage.trim();
    return trimmedMessage;
}
