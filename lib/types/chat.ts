import type { AllowedAiModels } from './ai.models';
import type { ReadChatConversation } from './database.tables/schema';

export type MinimalChat = {
  id: ReadChatConversation['id'];
  name: ReadChatConversation['name'];
  model: AllowedAiModels; // drizzle doesn't support checks yet...
};

export interface FullyFeaturedChat extends MinimalChat {
  created_at: ReadChatConversation['created_at'];
  updated_at: ReadChatConversation['updated_at'];
  neptun_user_id: ReadChatConversation['neptun_user_id'];
}

export type ChatConversationKeys = keyof ReadChatConversation;
export type OrderByDirection = (typeof possibleOrderByDirections)[number];
export const possibleOrderByColumns: ChatConversationKeys[] = [
  'id',
  'created_at',
  'updated_at',
  'name',
  'model',
] as const;
export const possibleOrderByDirections = ['asc', 'desc'] as const;
