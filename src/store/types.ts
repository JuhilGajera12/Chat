import {store} from './index';
import {RootStackParamList} from '../navigation/types';
import {ChatMessage} from '../types/chat';

export interface AuthState {
  user: {
    uid: string;
    email: string | null;
    displayName: string | null;
    createdAt?: string;
    lastLoginAt?: string;
  } | null;
  loading: boolean;
  error: {code: string; message: string} | null;
}

export interface SessionState {
  session: {
    user: {
      uid: string;
      email: string | null;
      displayName: string | null;
    };
    timestamp: string;
  } | null;
  loading: boolean;
  error: {code: string; message: string} | null;
}

export interface ChatState {
  conversations: any[];
  currentConversation: any | null;
  messages: ChatMessage[];
  users: {[key: string]: any};
  searchResults: any[];
  typingUsers: string[];
  loading: boolean;
  error: {code: string; message: string} | null;
  searchUsers: any[];
}

export interface NavigationState {
  initialRoute: keyof RootStackParamList;
  initializing: boolean;
  error: {code: string; message: string} | null;
}

export interface UIState {
  chatRoom: {
    selectedMessage: ChatMessage | null;
    typingUsers: string[];
    userStatus: {
      status: 'online' | 'offline';
      lastSeen?: string;
    };
  };
  userDiscovery: {
    searchQuery: string;
  };
}

export interface CollectionState {
  activeTab: number;
}

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
