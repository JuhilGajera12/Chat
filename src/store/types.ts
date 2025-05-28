import {ChatMessage, Conversation, ChatUser} from '../types/chat';
import {RootStackParamList} from '../navigation/types';

export interface AuthState {
  user: any | null;
  loading: boolean;
  error: any | null;
}

export interface SessionState {
  session: any | null;
  loading: boolean;
  error: any | null;
}

export interface ChatState {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: ChatMessage[];
  users: {[key: string]: ChatUser};
  typingUsers: string[];
  loading: boolean;
  error: {code: string; message: string} | null;
  searchResults: any[];
}

export interface NavigationState {
  initialRoute: keyof RootStackParamList;
  initializing: boolean;
}

export interface UIState {
  chatRoom: {
    selectedMessage: ChatMessage | null;
    typingUsers: string[];
    userStatus: {
      status: 'online' | 'offline';
      lastSeen?: Date;
    };
  };
  userDiscovery: {
    searchQuery: string;
  };
}

export interface RootState {
  auth: AuthState;
  session: SessionState;
  chat: ChatState;
  navigation: NavigationState;
  ui: UIState;
}
