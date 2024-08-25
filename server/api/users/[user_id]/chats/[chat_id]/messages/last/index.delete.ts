import { takeRightWhile, without /* dropRight */ } from 'es-toolkit';
import {
  deleteChatConversationMessage,
  readChatConversationMessages,
} from '~/server/database/repositories/chatConversationMessages';

// Delete last chat message of chat conversation
export default defineEventHandler(async (event) => {
  /* VALIDATE PARAMS */
  const maybeChatId = await validateParamChatId(event);
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

  const fetchedChatMessages = await readChatConversationMessages(chat_id);
  if (!fetchedChatMessages || fetchedChatMessages.length === 0) {
    return sendError(
      event,
      createError({
        statusCode: 400,
        statusMessage: 'Bad Request.',
        data: 'No messages found, for chat.',
      })
    );
  }

  // messages, that should not be there
  const userMessagesToDelete = takeRightWhile(
    fetchedChatMessages,
    (message) => message.actor === 'user'
  );
  const messagesDeletedSuccessfully: number[] = [];
  const messagesFailedToDelete: number[] = [];
  for (const message of userMessagesToDelete) {
    await deleteChatConversationMessage(message.id)
      .then(async () => {
        messagesDeletedSuccessfully.push(message.id);
      })
      .catch(() => {
        messagesFailedToDelete.push(message.id);
      });
  }

  const messagesLeft = without(fetchedChatMessages, ...userMessagesToDelete);

  // messages to delete
  if (messagesLeft.length < 2) {
    return {
      deletedSuccessfully: messagesDeletedSuccessfully,
      failedToDelete: messagesFailedToDelete,
    };
  }

  const maybeAssistantMessageToDelete = messagesLeft[messagesLeft.length - 1];
  const maybeUserMessageToDelete = messagesLeft[messagesLeft.length - 2];
  await deleteChatConversationMessage(maybeAssistantMessageToDelete.id);
  await deleteChatConversationMessage(maybeUserMessageToDelete.id);

  return {
    maybeAssistantMessageToDelete,
    maybeUserMessageToDelete,
  };

  // would delete the errored messages and the last 2 messages before:
  /* const indexOfFirstUserMessageToDelete = fetchedChatMessages.indexOf(userMessagesToDelete[0]);
  const assistantMessageToDelete = fetchedChatMessages[indexOfFirstUserMessageToDelete - 1];
  const actualUserMessagesToDelete = takeRightWhile(
    dropRight(
      fetchedChatMessages, fetchedChatMessages.length - indexOfFirstUserMessageToDelete + 1),
    (message) => message.actor === 'user'
  );

  const messageIds = userMessagesToDelete
    .map((message) => message.id)
    .concat(actualUserMessagesToDelete.map((message) => message.id));
  messageIds.push(assistantMessageToDelete.id);

  for (const id of messageIds) {
    await deleteChatConversationMessage(id);
  }

  return {
    messageIds
  }; */
});
