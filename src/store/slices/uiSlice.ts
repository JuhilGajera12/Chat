import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {ChatMessage} from '../../types/chat';

interface ChatRoomState {
  selectedMessage: ChatMessage | null;
  typingUsers: string[];
  userStatus: {
    status: 'online' | 'offline';
    lastSeen?: Date;
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
      state.chatRoom.selectedMessage = action.payload;
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
      state.chatRoom.userStatus = action.payload;
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

export const {
  setSelectedMessage,
  setTypingUsers,
  setUserStatus,
  setSearchQuery,
  resetChatRoom,
  resetUserDiscovery,
} = uiSlice.actions;

export default uiSlice.reducer;
