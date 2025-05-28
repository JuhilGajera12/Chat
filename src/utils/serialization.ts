import {ChatMessage, Conversation, ChatUser} from '../types/chat';

export const serializeDate = (date: Date | undefined | null): string | null => {
  if (!date) return null;
  return date.toISOString();
};

export const deserializeDate = (dateStr: string | null): Date | undefined => {
  if (!dateStr) return undefined;
  return new Date(dateStr);
};

export const serializeMessage = (message: ChatMessage): any => ({
  ...message,
  timestamp: serializeDate(message.timestamp),
});

export const deserializeMessage = (message: any): ChatMessage => ({
  ...message,
  timestamp: deserializeDate(message.timestamp) || new Date(),
});

export const serializeConversation = (conversation: Conversation): any => ({
  ...conversation,
  createdAt: serializeDate(conversation.createdAt),
  updatedAt: serializeDate(conversation.updatedAt),
  lastMessage: conversation.lastMessage
    ? serializeMessage(conversation.lastMessage)
    : undefined,
});

export const deserializeConversation = (conversation: any): Conversation => ({
  ...conversation,
  createdAt: deserializeDate(conversation.createdAt) || new Date(),
  updatedAt: deserializeDate(conversation.updatedAt) || new Date(),
  lastMessage: conversation.lastMessage
    ? deserializeMessage(conversation.lastMessage)
    : undefined,
});

export const serializeUser = (user: ChatUser): any => ({
  ...user,
  lastSeen: serializeDate(user.lastSeen),
});

export const deserializeUser = (user: any): ChatUser => ({
  ...user,
  lastSeen: deserializeDate(user.lastSeen),
});

export const firestoreTimestampToDate = (timestamp: any): Date => {
  if (timestamp?.toDate) {
    return timestamp.toDate();
  }
  if (typeof timestamp === 'number') {
    return new Date(timestamp);
  }
  if (typeof timestamp === 'string') {
    return new Date(timestamp);
  }
  return new Date();
};

export const dateToFirestoreTimestamp = (date: Date): number => {
  return date.getTime();
};
