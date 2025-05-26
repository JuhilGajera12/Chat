export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: number;
  status: 'sent' | 'delivered' | 'read';
  type: 'text' | 'image' | 'file';
  metadata?: {
    fileName?: string;
    fileUrl?: string;
    fileSize?: number;
    mimeType?: string;
  };
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage?: ChatMessage;
  unreadCount: {[userId: string]: number};
  updatedAt: number;
  createdAt: number;
  otherUser?: ChatUser | null;
}

export interface ChatUser {
  id: string;
  displayName: string;
  email: string;
  photoURL?: string;
  status?: 'online' | 'offline';
  lastSeen?: number;
}

export interface ChatState {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
  typingUsers: { [conversationId: string]: string[] };
} 