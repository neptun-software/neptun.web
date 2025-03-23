import type { ChatConversationFileToCreate } from '~/lib/types/database.tables/schema'
import {

  InsertFileUniversalSchema,
} from '~/lib/types/database.tables/schema'
import { createChatConversationFiles } from '~/server/database/repositories/chatConversationFiles'

// Create files for chat conversation
export default defineEventHandler(async (event) => {
  /* VALIDATE PARAMS */
  const maybeMessageId = await validateParamChatMessageId(event)
  if (maybeMessageId.statusCode !== 200) {
    return sendError(
      event,
      createError({
        statusCode: maybeMessageId.statusCode,
        statusMessage: maybeMessageId.statusMessage,
        data: maybeMessageId.data,
      }),
    )
  }
  const user_id = maybeMessageId.data?.user_id
  const chat_id = maybeMessageId.data?.chat_id
  const message_id = maybeMessageId.data?.message_id

  /* VALIDATE BODY */
  const body = await readValidatedBody(event, (body) => {
    return InsertFileUniversalSchema.safeParse(body)
  })

  if (!body.success || !body.data) {
    return sendError(
      event,
      createError({
        statusCode: 400,
        statusMessage: 'Bad Request. Invalid body(file | files). [1]',
        data: body.error,
      }),
    )
  }
  const validatedBody = body.data

  if (
    validatedBody
    && 'text' in validatedBody
    && 'title' in validatedBody
    && 'language' in validatedBody
    && 'extension' in validatedBody
  ) {
    const { text, title, language, extension } = validatedBody

    const conversationMessageFileToCreate = {
      text,
      title,
      language,
      extension,
      neptun_user_id: user_id,
      chat_conversation_id: chat_id,
      chat_conversation_message_id: message_id,
    } as ChatConversationFileToCreate

    const createdFile = await createChatConversationFiles([
      conversationMessageFileToCreate,
    ])

    return {
      chatFile: createdFile,
    }
  } else if (validatedBody && 'files' in validatedBody) {
    const files = validatedBody.files.map(
      ({ text, title, language, extension }) => ({
        text,
        title,
        language,
        extension,
        neptun_user_id: user_id,
        chat_conversation_id: chat_id,
        chat_conversation_message_id: message_id,
      }),
    )

    const createdFiles = await createChatConversationFiles(files)

    return {
      chatFiles: createdFiles,
    }
  }

  return sendError(
    event,
    createError({
      statusCode: 400,
      statusMessage: 'Bad Request. Invalid body(file | files). [2]',
    }),
  )
})
