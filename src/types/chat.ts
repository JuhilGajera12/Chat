export interface ChatUser {
  id: string;
  displayName: string;
  email: string;
  photoURL?: string;
  status: 'online' | 'offline';
  lastSeen?: Date;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read';
  type: 'text' | 'image' | 'file';
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage?: ChatMessage;
  unreadCount: {[userId: string]: number};
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatState {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
  typingUsers: {[conversationId: string]: string[]};
}

export interface TypingStatus {
  userId: string;
  timestamp: Date;
}
