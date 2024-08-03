import { HuggingFaceStream, type Message, StreamingTextResponse } from 'ai';
import { HfInference } from '@huggingface/inference';
import {
  experimental_buildOpenAssistantPrompt,
  experimental_buildLlama2Prompt,
} from 'ai/prompts';
import { ALLOWED_AI_MODELS, POSSIBLE_AI_MODELS } from '~/lib/types/ai.models';
import {
  validateParamAiModelName,
  validateQueryChatId,
} from '~/server/utils/validate';
import type { User } from '#auth-utils';
import type { H3Event, EventHandlerRequest } from 'h3';
import type { Actor } from '~/lib/types/database.tables/schema';
import { getCodeBlocksFromMarkdown } from '~/utils/parse';
import { ChatConversationMessagesToCreateSchema } from '~/lib/types/database.tables/schema';

async function persistCodeBlocks(
  user_id: number,
  chat_id: number,
  message_id: number,
  markdown: string,
  event: H3Event<EventHandlerRequest>
) {
  const codeBlocks = await getCodeBlocksFromMarkdown(markdown);

  if (LOG_BACKEND) console.log('codeBlocks', codeBlocks);
  if (codeBlocks.length > 0) {
    if (LOG_BACKEND)
      console.log(`persisting ${codeBlocks.length} code block(s)...`);

    const persistedCodeBlocks = await event.$fetch(
      `/api/users/${user_id}/chats/${chat_id}/files/${message_id}`,
      {
        // .event.$fetch used because it contains the current session
        method: 'POST',
        body: {
          files: codeBlocks,
        },
      }
    );

    if (LOG_BACKEND) {
      console.info(
        'persistCodeBlocks:',
        persistedCodeBlocks,
        user_id,
        chat_id,
        message_id
      );
    }

    return persistedCodeBlocks;
  }

  return null;
}

async function persistChatMessage(
  user_id: number,
  chat_id: number,
  messageText: string,
  actor: 'user' | 'assistant' = 'user',
  event: H3Event<EventHandlerRequest>
) {
  if (chat_id >= 1) {
    const persistedChatMessage = await event.$fetch(
      `/api/users/${user_id}/chats/${chat_id}/messages`,
      {
        // .event.$fetch used because it contains the current session
        method: 'POST',
        body: {
          message: messageText,
          actor,
        },
      }
    );

    if (LOG_BACKEND)
      console.info(
        'persistChatMessage:',
        persistedChatMessage,
        user_id,
        chat_id,
        messageText
      );

    const chatMessage =
      persistedChatMessage && 'chatMessage' in persistedChatMessage
        ? persistedChatMessage.chatMessage
          ? persistedChatMessage.chatMessage[0]
          : null
        : null;
    return chatMessage;
  }

  return null;
}

async function persistAiChatMessage(
  user_id: number,
  chat_id: number,
  messageText: string,
  event: H3Event<EventHandlerRequest>
) {
  const persistedChatMessage = await persistChatMessage(
    user_id,
    chat_id,
    messageText,
    'assistant',
    event
  );

  if (!persistedChatMessage) return persistedChatMessage;
  const {
    chat_user_id,
    chat_conversation_id,
    id: message_id,
    message,
  } = persistedChatMessage;
  const persistedCodeBlocks = await persistCodeBlocks(
    chat_user_id,
    chat_conversation_id,
    message_id,
    message,
    event
  );

  if (
    persistedCodeBlocks &&
    'chatFiles' in persistedCodeBlocks &&
    persistedCodeBlocks.chatFiles
  ) {
    return {
      chat_message: persistedChatMessage,
      code_blocks: persistedCodeBlocks.chatFiles, // TODO: find out how to get type, if not clear, what route it is (made it [message_id]/[file_id] instead of /[message_id] and /[file_id] for now)
    };
  }
}

async function persistUserChatMessage(
  user_id: number,
  chat_id: number,
  messageText: string,
  event: H3Event<EventHandlerRequest>
) {
  await persistChatMessage(user_id, chat_id, messageText, 'user', event);
}

export default defineLazyEventHandler(async () => {
  const apiKey = useRuntimeConfig().huggingfaceApiKey;
  const Hf = new HfInference(apiKey);

  return defineEventHandler(async (event) => {
    /* 0. VALIDATE METHOD */
    assertMethod(event, ['POST']);
    const user = event.context.user as User;

    /* VALIDATE QUERY */
    const maybeChatId = await validateQueryChatId(event);
    if (maybeChatId.statusCode !== 200) {
      return sendError(
        event,
        createError({
          statusCode: maybeChatId.statusCode,
          statusMessage: maybeChatId.statusMessage,
          data: maybeChatId.data,
        })
      );
    }
    const chat_id = maybeChatId.data?.chat_id;

    /* VALIDATE PARAMS */
    const maybeModelName = await validateParamAiModelName(event);
    if (maybeModelName.statusCode !== 200) {
      return sendError(
        event,
        createError({
          statusCode: maybeModelName.statusCode,
          statusMessage: maybeModelName.statusMessage,
          data: maybeModelName.data,
        })
      );
    }
    const model_name = maybeModelName.data?.model_name;
    const model_publisher = maybeModelName.data?.model_publisher;

    if (LOG_BACKEND)
      console.info(`Fetching model: ${model_publisher}/${model_name}...`);

    const body = await readValidatedBody(event, (body) => {
      // complete chat history
      return ChatConversationMessagesToCreateSchema.safeParse(body);
    });
    if (!body.success || !body.data) {
      return sendError(
        event,
        createError({
          statusCode: 400,
          statusMessage: 'Bad Request. Invalid body(message | messages).',
          data: body.error,
        })
      );
    }
    const validatedBody = body.data;
    const { messages } = validatedBody;

    const SYSTEM_MESSAGE =
      'You have to answer all my questions and provide all information using Markdown syntax. This includes formatting text, adding lists, inserting links, using code blocks, and any other Markdown features that are appropriate for your responses.';
    if (!messages.some((message) => message.content === SYSTEM_MESSAGE)) {
      if (LOG_BACKEND)
        console.info(
          'No system message found. Adding initial system message...'
        );

      // TODO: freshly add this every time the context is truncated
      messages.unshift({
        role: 'user' as Actor, // ERROR: AI request errored: OpenAssistant does not support system messages.
        content: SYSTEM_MESSAGE,
      });
    }

    const userMessage = messages[messages.length - 1]; // { role: 'user', content: 'message' }
    // if (LOG_BACKEND) console.info("current user message", userMessage);
    await persistUserChatMessage(user.id, chat_id, userMessage.content, event);

    try {
      // if (LOG_BACKEND) console.info('allowed models:', ALLOWED_AI_MODELS);
      if (
        !model_name ||
        !model_publisher ||
        !ALLOWED_AI_MODELS.includes(`${model_publisher}/${model_name}`)
      ) {
        // if (LOG_BACKEND) console.warn(`Invalid model name or publisher: ${model_publisher}/${model_name}. Allowed are '${ALLOWED_AI_MODELS.join(', ')}'`);
        sendError(
          event,
          createError({
            statusCode: 400,
            statusMessage: 'Invalid model name or publisher',
          })
        );
      }

      let inputs = String(messages);
      const minimalMessages = messages as Pick<Message, 'content' | 'role'>[];
      if (model_name === 'oasst-sft-4-pythia-12b-epoch-3.5') {
        inputs = experimental_buildOpenAssistantPrompt(minimalMessages); // basically convertToCoreMessages from 'ai'
        // if (LOG_BACKEND) console.info('using custom prompt builder for OpenAssistant');
      } else if (model_name === 'Mistral-7B-Instruct-v0.1') {
        inputs = experimental_buildLlama2Prompt(minimalMessages);
        // if (LOG_BACKEND) console.info('using custom prompt builder for Llama2');
      }

      // if (LOG_BACKEND) console.info('---');
      // if (LOG_BACKEND) console.info('AI request:', inputs);
      // if (LOG_BACKEND) console.info('---');

      const response = Hf.textGenerationStream(
        POSSIBLE_AI_MODELS?.[model_publisher ?? 'OpenAssistant']?.[
          model_name ?? 'oasst-sft-4-pythia-12b-epoch-3.5'
        ]?.configuration(inputs)
      );

      // https://sdk.vercel.ai/docs/ai-sdk-ui/storing-messages
      const stream = HuggingFaceStream(response, {
        async onFinal(messageText: string) {
          // onCompletion, onFinal, onToken and onText is called for each token (word, punctuation)
          await persistAiChatMessage(user.id, chat_id, messageText, event);
        },
      }); // Converts the response into a friendly text-stream

      return new StreamingTextResponse(stream); // Respond with the stream
    } catch (error) {
      if (LOG_BACKEND) console.error('AI request errored:', error);
      sendError(
        event,
        createError({
          statusCode: 500,
          statusMessage: 'Internal Server Error',
        })
      );
    }
  });
});
