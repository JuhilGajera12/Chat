import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {ChatMessage} from '../../types/chat';
import {
  serializeMessage,
  deserializeMessage,
  serializeDate,
  deserializeDate,
} from '../../utils/serialization';

interface ChatRoomState {
  selectedMessage: ChatMessage | null;
  typingUsers: string[];
  userStatus: {
    status: 'online' | 'offline';
    lastSeen?: string;
  };
}

interface UserDiscoveryState {
  searchQuery: string;
}

interface UIState {
  chatRoom: ChatRoomState;
  userDiscovery: UserDiscoveryState;
}

const initialState: UIState = {
  chatRoom: {
    selectedMessage: null,
    typingUsers: [],
    userStatus: {
      status: 'offline',
    },
  },
  userDiscovery: {
    searchQuery: '',
  },
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setSelectedMessage: (state, action: PayloadAction<ChatMessage | null>) => {
      state.chatRoom.selectedMessage = action.payload
        ? serializeMessage(action.payload)
        : null;
    },
    setTypingUsers: (state, action: PayloadAction<string[]>) => {
      state.chatRoom.typingUsers = action.payload;
    },
    setUserStatus: (
      state,
      action: PayloadAction<{
        status: 'online' | 'offline';
        lastSeen?: Date;
      }>,
    ) => {
      const lastSeen = action.payload.lastSeen
        ? serializeDate(action.payload.lastSeen)
        : undefined;
      state.chatRoom.userStatus = {
        status: action.payload.status,
        lastSeen: lastSeen || undefined,
      };
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.userDiscovery.searchQuery = action.payload;
    },
    resetChatRoom: state => {
      state.chatRoom = initialState.chatRoom;
    },
    resetUserDiscovery: state => {
      state.userDiscovery = initialState.userDiscovery;
    },
  },
});

export const selectSelectedMessage = (state: {ui: UIState}) =>
  state.ui.chatRoom.selectedMessage
    ? deserializeMessage(state.ui.chatRoom.selectedMessage)
    : null;

export const selectUserStatus = (state: {ui: UIState}) => ({
  ...state.ui.chatRoom.userStatus,
  lastSeen: state.ui.chatRoom.userStatus.lastSeen
    ? deserializeDate(state.ui.chatRoom.userStatus.lastSeen)
    : undefined,
});

export const {
  setSelectedMessage,
  setTypingUsers,
  setUserStatus,
  setSearchQuery,
  resetChatRoom,
  resetUserDiscovery,
} = uiSlice.actions;

export default uiSlice.reducer;
