import type { Message } from 'ai'
import type { EventHandlerRequest, H3Event } from 'h3'
import { getCodeBlocksFromMarkdown } from '~/utils/parse'

export function buildMetaLlama3Prompt(
  messages: Pick<Message, 'content' | 'role'>[],
) {
  let prompt = '<|begin_of_text|>\n'

  messages.forEach((message) => {
    const { role, content } = message
    prompt += `<|start_header_id|>${role}<|end_header_id|>\n\n${content}\n\n`
  })

  prompt += '<|eot_id|>'
  return prompt
}

export function buildGemma2Prompt(
  messages: Pick<Message, 'content' | 'role'>[],
) {
  let prompt = '<bos>'

  messages.forEach((message) => {
    const { role, content } = message
    prompt += `<start_of_turn>${role}\n${content}<end_of_turn>\n`
  })

  // Add the final model turn marker
  prompt += '<start_of_turn>model\n'

  return prompt
}

export function buildPhi3Prompt(
  messages: Pick<Message, 'content' | 'role'>[],
) {
  let prompt = ''

  messages.forEach((message) => {
    const { role, content } = message
    if (role === 'system') {
      prompt += `<|system|>\n${content}<|end|>\n`
    } else if (role === 'user') {
      prompt += `<|user|>\n${content}<|end|>\n`
    } else if (role === 'assistant') {
      prompt += `<|assistant|>\n${content}<|end|>\n`
    }
  })

  // Add the assistant marker for the model's response
  prompt += '<|assistant|>\n'

  return prompt
}

export function buildQwen25Prompt(
  messages: Pick<Message, 'content' | 'role'>[],
) {
  let prompt = ''

  messages.forEach((message) => {
    const { role, content } = message
    if (role === 'system') {
      prompt += `<|im_start|>system\n${content}<|im_end|>\n`
    } else if (role === 'user') {
      prompt += `<|im_start|>user\n${content}<|im_end|>\n`
    } else if (role === 'assistant') {
      prompt += `<|im_start|>assistant\n${content}<|im_end|>\n`
    }
  })

  // Add the assistant marker for the model's response
  prompt += '<|im_start|>assistant\n'

  return prompt
}

export function buildMistralNemoPrompt(
  messages: Pick<Message, 'content' | 'role'>[],
) {
  let prompt = ''

  messages.forEach((message) => {
    const { role, content } = message
    if (role === 'system') {
      prompt += `<|im_start|>system\n${content}<|im_end|>\n`
    } else if (role === 'user') {
      prompt += `<|im_start|>user\n${content}<|im_end|>\n`
    } else if (role === 'assistant') {
      prompt += `<|im_start|>assistant\n${content}<|im_end|>\n`
    }
  })

  // Add the assistant marker for the model's response
  prompt += '<|im_start|>assistant\n'

  return prompt
}

export function buildMistral7BV3Prompt(
  messages: Pick<Message, 'content' | 'role'>[],
) {
  let prompt = ''

  messages.forEach((message) => {
    const { role, content } = message
    if (role === 'system') {
      prompt += `<|system|>${content}</s>`
    } else if (role === 'user') {
      prompt += `[INST]${content}[/INST]`
    } else if (role === 'assistant') {
      prompt += `${content}</s>`
    }
  })

  return prompt
}

export async function persistCodeBlocks(
  user_id: number,
  chat_id: number,
  message_id: number,
  markdown: string,
  event: H3Event<EventHandlerRequest>,
) {
  try {
    const codeBlocks = await getCodeBlocksFromMarkdown(markdown)
    if (LOG_BACKEND) {
      if (codeBlocks.length > 0) {
        // console.log('codeBlocks', codeBlocks);

        if (LOG_BACKEND) {
          // console.log(`persisting ${codeBlocks.length} code block(s)...`);
        }

        const persistedCodeBlocks = await event.$fetch(
          `/api/users/${user_id}/chats/${chat_id}/files/${message_id}`,
          {
            // .event.$fetch used because it contains the current session
            method: 'POST',
            body: {
              files: codeBlocks,
            },
          },
        )

        if (LOG_BACKEND) {
          console.info(
            'persistCodeBlocks:',
            persistedCodeBlocks,
            user_id,
            chat_id,
            message_id,
          )
        }

        return persistedCodeBlocks
      }
    }
  } catch (error) {
    if (LOG_BACKEND) {
      console.error('Persisting code blocks errored:', error)
    }
    return null
  }

  return null
}

export async function persistChatMessage(
  user_id: number,
  chat_id: number,
  messageText: string,
  actor: 'user' | 'assistant' = 'user',
  event: H3Event<EventHandlerRequest>,
) {
  if (chat_id >= 1) {
    try {
      const persistedChatMessage = await event.$fetch(
        `/api/users/${user_id}/chats/${chat_id}/messages`,
        {
          // .event.$fetch used because it contains the current session
          method: 'POST',
          body: {
            message: messageText,
            actor,
          },
        },
      )

      if (LOG_BACKEND) {
        console.info(
          'persistChatMessage:',
          persistedChatMessage,
          user_id,
          chat_id,
          messageText,
        )
      }

      const chatMessage
        = persistedChatMessage && 'chatMessage' in persistedChatMessage
          ? persistedChatMessage.chatMessage
            ? persistedChatMessage.chatMessage[0]
            : null
          : null
      return chatMessage
    } catch (error) {
      if (LOG_BACKEND) {
        console.error('Persisting chat message errored:', error)
      }
    }
  }

  return null
}

export async function persistAiChatMessage(
  user_id: number,
  chat_id: number,
  messageText: string,
  event: H3Event<EventHandlerRequest>,
) {
  const persistedChatMessage = await persistChatMessage(
    user_id,
    chat_id,
    messageText,
    'assistant',
    event,
  )

  if (!persistedChatMessage) {
    return persistedChatMessage
  }
  const {
    neptun_user_id,
    chat_conversation_id,
    id: message_id,
    message,
  } = persistedChatMessage
  const persistedCodeBlocks = await persistCodeBlocks(
    neptun_user_id,
    chat_conversation_id,
    message_id,
    message,
    event,
  )

  if (
    persistedCodeBlocks
    && 'chatFiles' in persistedCodeBlocks
    && persistedCodeBlocks.chatFiles
  ) {
    return {
      chat_message: persistedChatMessage,
      code_blocks: persistedCodeBlocks.chatFiles, // TODO: find out how to get type, if not clear, what route it is (made it [message_id]/[file_id] instead of /[message_id] and /[file_id] for now)
    }
  }
}

export async function persistUserChatMessage(
  user_id: number,
  chat_id: number,
  messageText: string,
  event: H3Event<EventHandlerRequest>,
) {
  await persistChatMessage(user_id, chat_id, messageText, 'user', event)
}
