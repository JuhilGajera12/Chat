import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import {ChatMessage, Conversation, ChatUser} from '../../types/chat';
import {RootState} from '../types';
import {
  serializeMessage,
  deserializeMessage,
  serializeConversation,
  deserializeConversation,
  deserializeUser,
  dateToFirestoreTimestamp,
  firestoreTimestampToDate,
} from '../../utils/serialization';
import {PayloadAction} from '@reduxjs/toolkit';

const MESSAGES_COLLECTION = 'messages';
const CONVERSATIONS_COLLECTION = 'conversations';
const USERS_COLLECTION = 'users';

export interface ChatState {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: ChatMessage[];
  users: {[key: string]: ChatUser};
  searchResults: ChatUser[];
  typingUsers: string[];
  loading: boolean;
  error: {code: string; message: string} | null;
  searchUsers: [];
}

const initialState: ChatState = {
  conversations: [],
  currentConversation: null,
  messages: [],
  users: {},
  searchResults: [],
  typingUsers: [],
  loading: false,
  error: null,
  searchUsers: [],
};

export const updateUserStatus = createAsyncThunk(
  'chat/updateUserStatus',
  async ({userId, status}: {userId: string; status: 'online' | 'offline'}) => {
    try {
      const userRef = firestore().collection(USERS_COLLECTION).doc(userId);
      const timestamp =
        status === 'offline' ? dateToFirestoreTimestamp(new Date()) : null;
      await userRef.update({
        status,
        lastSeen: timestamp,
      });
      return {userId, status, lastSeen: timestamp};
    } catch (error: any) {
      throw {code: error.code, message: 'Error updating user status'};
    }
  },
);

export const getUser = createAsyncThunk(
  'chat/getUser',
  async (userId: string) => {
    try {
      const userDoc = await firestore()
        .collection(USERS_COLLECTION)
        .doc(userId)
        .get();
      if (!userDoc.exists) {
        throw {code: 'not-found', message: 'User not found'};
      }
      return userDoc.data() as ChatUser;
    } catch (error: any) {
      throw {code: error.code, message: 'Error getting user'};
    }
  },
);

export const createConversation = createAsyncThunk(
  'chat/createConversation',
  async (participants: string[]) => {
    try {
      const now = new Date();
      const timestamp = dateToFirestoreTimestamp(now);
      const conversationRef = await firestore()
        .collection(CONVERSATIONS_COLLECTION)
        .add({
          participants,
          createdAt: timestamp,
          updatedAt: timestamp,
          unreadCount: participants.reduce((acc, userId) => {
            acc[userId] = 0;
            return acc;
          }, {} as {[userId: string]: number}),
        });

      const conversation: Conversation = {
        id: conversationRef.id,
        participants,
        createdAt: now,
        updatedAt: now,
        unreadCount: participants.reduce((acc, userId) => {
          acc[userId] = 0;
          return acc;
        }, {} as {[userId: string]: number}),
      };

      return serializeConversation(conversation);
    } catch (error: any) {
      throw {code: error.code, message: 'Error creating conversation'};
    }
  },
);

export const getConversations = createAsyncThunk(
  'chat/getConversations',
  async (userId: string) => {
    try {
      const snapshot = await firestore()
        .collection(CONVERSATIONS_COLLECTION)
        .where('participants', 'array-contains', userId)
        .orderBy('updatedAt', 'desc')
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Conversation[];
    } catch (error: any) {
      throw {code: error.code, message: 'Error getting conversations'};
    }
  },
);

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({
    conversationId,
    message,
  }: {
    conversationId: string;
    message: Omit<ChatMessage, 'id' | 'timestamp' | 'status'> & {
      receiverId: string;
    };
  }) => {
    try {
      const batch = firestore().batch();
      const conversationRef = firestore()
        .collection(CONVERSATIONS_COLLECTION)
        .doc(conversationId);
      const messageRef = conversationRef.collection(MESSAGES_COLLECTION).doc();
      const now = new Date();
      const timestamp = dateToFirestoreTimestamp(now);

      const messageData: ChatMessage = {
        ...message,
        id: messageRef.id,
        timestamp: now,
        status: 'sent' as const,
      };

      const serializedMessage = serializeMessage(messageData);

      batch.set(messageRef, {
        ...serializedMessage,
        timestamp,
      });

      batch.update(conversationRef, {
        lastMessage: {
          ...serializedMessage,
          timestamp,
        },
        updatedAt: timestamp,
        [`unreadCount.${message.receiverId}`]:
          firestore.FieldValue.increment(1),
      });

      await batch.commit();
      return {message: serializedMessage, conversationId};
    } catch (error: any) {
      throw {code: error.code, message: 'Error sending message'};
    }
  },
);

export const getMessages = createAsyncThunk(
  'chat/getMessages',
  async ({
    conversationId,
    limit = 20,
    lastMessageId,
  }: {
    conversationId: string;
    limit?: number;
    lastMessageId?: string;
  }) => {
    try {
      let query = firestore()
        .collection(CONVERSATIONS_COLLECTION)
        .doc(conversationId)
        .collection(MESSAGES_COLLECTION)
        .orderBy('timestamp', 'desc')
        .limit(limit);

      if (lastMessageId) {
        const lastMessage = await firestore()
          .collection(CONVERSATIONS_COLLECTION)
          .doc(conversationId)
          .collection(MESSAGES_COLLECTION)
          .doc(lastMessageId)
          .get();
        query = query.startAfter(lastMessage);
      }

      const snapshot = await query.get();
      const messages = snapshot.docs.map(doc => {
        const data = doc.data();
        return serializeMessage({
          id: doc.id,
          ...data,
          timestamp: firestoreTimestampToDate(data.timestamp),
        } as ChatMessage);
      });
      return messages;
    } catch (error: any) {
      throw {code: error.code, message: 'Error getting messages'};
    }
  },
);

export const markConversationAsRead = createAsyncThunk(
  'chat/markConversationAsRead',
  async ({
    conversationId,
    userId,
  }: {
    conversationId: string;
    userId: string;
  }) => {
    try {
      const conversationRef = firestore()
        .collection(CONVERSATIONS_COLLECTION)
        .doc(conversationId);

      await conversationRef.update({
        [`unreadCount.${userId}`]: 0,
      });

      return {conversationId, userId};
    } catch (error: any) {
      throw {code: error.code, message: 'Error marking conversation as read'};
    }
  },
);

export const uploadFile = createAsyncThunk(
  'chat/uploadFile',
  async ({
    conversationId,
    uri,
    fileName,
  }: {
    conversationId: string;
    uri: string;
    fileName: string;
  }) => {
    try {
      const reference = storage().ref(`chats/${conversationId}/${fileName}`);
      await reference.putFile(uri);
      const url = await reference.getDownloadURL();
      return url;
    } catch (error: any) {
      throw {code: error.code, message: 'Error uploading file'};
    }
  },
);

export const setTypingStatus = createAsyncThunk(
  'chat/setTypingStatus',
  async ({
    conversationId,
    userId,
    isTyping,
  }: {
    conversationId: string;
    userId: string;
    isTyping: boolean;
  }) => {
    try {
      const typingRef = firestore()
        .collection(CONVERSATIONS_COLLECTION)
        .doc(conversationId)
        .collection('typing')
        .doc(userId);

      if (isTyping) {
        await typingRef.set({
          userId,
          timestamp: Date.now(),
        });
      } else {
        await typingRef.delete();
      }
      return {userId, isTyping};
    } catch (error: any) {
      throw {code: error.code, message: 'Error setting typing status'};
    }
  },
);

export const searchUsers = createAsyncThunk(
  'chat/searchUsers',
  async (query: string) => {
    try {
      const snapshot = await firestore()
        .collection(USERS_COLLECTION)
        .where('displayName', '>=', query)
        .where('displayName', '<=', query + '\uf8ff')
        .limit(10)
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as ChatUser[];
    } catch (error: any) {
      throw {code: error.code, message: 'Error searching users'};
    }
  },
);

export const findConversation = createAsyncThunk(
  'chat/findConversation',
  async ({userId1, userId2}: {userId1: string; userId2: string}) => {
    try {
      const snapshot = await firestore()
        .collection(CONVERSATIONS_COLLECTION)
        .where('participants', 'array-contains', userId1)
        .get();

      const conversation = snapshot.docs
        .map(doc => ({id: doc.id, ...doc.data()} as Conversation))
        .find(conv => conv.participants.includes(userId2));

      return conversation || null;
    } catch (error: any) {
      throw {code: error.code, message: 'Error finding conversation'};
    }
  },
);

export const initializeChat = createAsyncThunk(
  'chat/initializeChat',
  async (userId: string) => {
    try {
      const conversationsSnapshot = await firestore()
        .collection(CONVERSATIONS_COLLECTION)
        .where('participants', 'array-contains', userId)
        .orderBy('updatedAt', 'desc')
        .get();

      const conversations = conversationsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Conversation[];

      const userIds = new Set<string>();
      conversations.forEach(convo => {
        convo.participants.forEach(id => {
          if (id !== userId) {
            userIds.add(id);
          }
        });
      });

      const userPromises = Array.from(userIds).map(async id => {
        const userDoc = await firestore()
          .collection(USERS_COLLECTION)
          .doc(id)
          .get();
        if (!userDoc.exists) {
          throw {code: 'not-found', message: `User ${id} not found`};
        }
        return {id, ...userDoc.data()} as ChatUser;
      });

      const users = await Promise.all(userPromises);
      const usersMap = users.reduce((acc, user) => {
        acc[user.id] = user;
        return acc;
      }, {} as {[key: string]: ChatUser});

      return {conversations, users: usersMap};
    } catch (error: any) {
      throw {code: error.code, message: 'Error initializing chat'};
    }
  },
);

export const updateMessageStatus = createAsyncThunk(
  'chat/updateMessageStatus',
  async ({
    conversationId,
    messageId,
    status,
  }: {
    conversationId: string;
    messageId: string;
    status: 'delivered' | 'read';
  }) => {
    try {
      const messageRef = firestore()
        .collection(CONVERSATIONS_COLLECTION)
        .doc(conversationId)
        .collection(MESSAGES_COLLECTION)
        .doc(messageId);
      await messageRef.update({status});
      return {conversationId, messageId, status};
    } catch (error: any) {
      throw {code: error.code, message: 'Error updating message status'};
    }
  },
);

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    clearError: state => {
      state.error = null;
    },
    setCurrentConversation: (state, action) => {
      state.currentConversation = action.payload;
    },
    addMessage: (state, action) => {
      state.messages.unshift(action.payload);
    },
    setMessages: (state, action: PayloadAction<ChatMessage[]>) => {
      state.messages = action.payload;
    },
    setTypingUsers: (state, action) => {
      state.typingUsers = action.payload;
    },
    clearMessages: state => {
      state.messages = [];
    },
  },
  extraReducers: builder => {
    builder
      .addCase(updateUserStatus.fulfilled, (state, action) => {
        const {userId, status, lastSeen} = action.payload;
        if (state.users[userId]) {
          state.users[userId].status = status;
          state.users[userId].lastSeen = lastSeen
            ? new Date(lastSeen)
            : undefined;
        }
      })
      .addCase(getUser.fulfilled, (state, action) => {
        state.users[action.payload.id] = deserializeUser(action.payload);
      })
      .addCase(createConversation.fulfilled, (state, action) => {
        state.conversations.unshift(deserializeConversation(action.payload));
      })
      .addCase(getConversations.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getConversations.fulfilled, (state, action) => {
        state.loading = false;
        state.conversations = action.payload.map(deserializeConversation);
      })
      .addCase(getConversations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as {code: string; message: string};
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        const {conversationId} = action.payload;
        if (
          state.currentConversation &&
          state.currentConversation.id === conversationId
        ) {
          const message = deserializeMessage(action.payload.message);
          state.currentConversation.lastMessage = message;
          state.currentConversation.updatedAt = message.timestamp;
        }
      })
      .addCase(getMessages.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.messages = action.payload.map(deserializeMessage);
      })
      .addCase(getMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as {code: string; message: string};
      })
      .addCase(markConversationAsRead.fulfilled, (state, action) => {
        const {conversationId, userId} = action.payload;
        const conversation = state.conversations.find(
          c => c.id === conversationId,
        );
        if (conversation) {
          conversation.unreadCount[userId] = 0;
        }
      })
      .addCase(markConversationAsRead.rejected, (state, action) => {
        state.error = action.payload as {code: string; message: string};
      })
      .addCase(searchUsers.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.searchResults = action.payload;
      })
      .addCase(searchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as {code: string; message: string};
      })
      .addCase(findConversation.fulfilled, (state, action) => {
        if (action.payload) {
          state.currentConversation = action.payload;
        }
      })
      .addCase(initializeChat.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(initializeChat.fulfilled, (state, action) => {
        state.loading = false;
        state.conversations = action.payload.conversations;
        state.users = action.payload.users;
      })
      .addCase(initializeChat.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as {code: string; message: string};
      })
      .addCase(updateMessageStatus.fulfilled, (state, action) => {
        const {messageId, status} = action.payload;
        const message = state.messages.find(m => m.id === messageId);
        if (message) {
          message.status = status;
        }
      });
  },
});

export const {
  clearError,
  setCurrentConversation,
  addMessage,
  setMessages,
  setTypingUsers,
  clearMessages,
} = chatSlice.actions;

export const selectChat = (state: RootState) => state.chat;

export default chatSlice.reducer;
