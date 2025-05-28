import {TypedUseSelectorHook, useDispatch, useSelector} from 'react-redux';
import {useMemo, useCallback} from 'react';
import type {RootState} from '../store/types';
import type {AppDispatch} from '../store';
import {
  signInWithEmail,
  signUpWithEmail,
  signOut,
  resetPassword,
  createUserProfile,
  clearError as clearAuthError,
} from '../store/slices/authSlice';
import {
  saveUserSession,
  getUserSession,
  clearUserSession,
  handleLogout,
  clearError as clearSessionError,
} from '../store/slices/sessionSlice';
import {
  updateUserStatus,
  getUser,
  createConversation,
  getConversations,
  sendMessage,
  getMessages,
  markConversationAsRead,
  uploadFile,
  setTypingStatus,
  searchUsers,
  findConversation,
  setCurrentConversation,
  addMessage,
  updateMessageStatus,
  setTypingUsers,
  clearMessages,
  clearError as clearChatError,
  initializeChat,
} from '../store/slices/chatSlice';
import {ChatMessage, Conversation, ChatUser} from '../types/chat';
import firestore from '@react-native-firebase/firestore';
import {FirebaseFirestoreTypes} from '@react-native-firebase/firestore';
import {firestoreTimestampToDate} from '../utils/serialization';

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const {user, loading, error} = useAppSelector(
    (state: RootState) => state.auth,
    (prev, next) =>
      prev.user === next.user &&
      prev.loading === next.loading &&
      prev.error === next.error,
  );

  const actions = useMemo(
    () => ({
      signInWithEmail: (email: string, password: string) =>
        dispatch(signInWithEmail({email, password})),
      signUpWithEmail: (email: string, password: string) =>
        dispatch(signUpWithEmail({email, password})),
      signOut: () => dispatch(signOut()),
      resetPassword: (email: string) => dispatch(resetPassword(email)),
      createUserProfile: (user: any, name: string) =>
        dispatch(createUserProfile({user, name})),
      clearError: () => dispatch(clearAuthError()),
    }),
    [dispatch],
  );

  return useMemo(
    () => ({
      user,
      loading,
      error,
      ...actions,
    }),
    [user, loading, error, actions],
  );
};

export const useSession = () => {
  const dispatch = useAppDispatch();
  const {session, loading, error} = useAppSelector(
    (state: RootState) => state.session,
    (prev, next) =>
      prev.session === next.session &&
      prev.loading === next.loading &&
      prev.error === next.error,
  );

  const actions = useMemo(
    () => ({
      saveUserSession: (user: any) => dispatch(saveUserSession(user)),
      getUserSession: () => dispatch(getUserSession()),
      clearUserSession: () => dispatch(clearUserSession()),
      handleLogout: () => dispatch(handleLogout()),
      clearError: () => dispatch(clearSessionError()),
    }),
    [dispatch],
  );

  return useMemo(
    () => ({
      session,
      loading,
      error,
      ...actions,
    }),
    [session, loading, error, actions],
  );
};

export const useChat = () => {
  const dispatch = useAppDispatch();
  const {
    conversations,
    currentConversation,
    messages,
    users,
    searchResults,
    typingUsers,
    loading,
    error,
  } = useAppSelector(
    (state: RootState) => state.chat,
    (prev, next) =>
      prev.conversations === next.conversations &&
      prev.currentConversation === next.currentConversation &&
      prev.messages === next.messages &&
      prev.users === next.users &&
      prev.searchResults === next.searchResults &&
      prev.typingUsers === next.typingUsers &&
      prev.loading === next.loading &&
      prev.error === next.error,
  );

  const subscribeToMessages = useCallback(
    (conversationId: string, callback: (messages: ChatMessage[]) => void) => {
      return firestore()
        .collection('conversations')
        .doc(conversationId)
        .collection('messages')
        .orderBy('timestamp', 'desc')
        .onSnapshot((snapshot: FirebaseFirestoreTypes.QuerySnapshot) => {
          const messages = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            timestamp: firestoreTimestampToDate(doc.data().timestamp),
          })) as ChatMessage[];
          callback(messages);
        });
    },
    [],
  );

  const subscribeToTypingStatus = useCallback(
    (
      conversationId: string,
      callback: (typingUsers: string[]) => void,
      currentUserId: string,
    ) => {
      return firestore()
        .collection('conversations')
        .doc(conversationId)
        .collection('typing')
        .onSnapshot((snapshot: FirebaseFirestoreTypes.QuerySnapshot) => {
          const users = snapshot.docs.map((doc: FirebaseFirestoreTypes.QueryDocumentSnapshot) => doc.id);
          const otherTypingUsers = users.filter((id: string) => id !== currentUserId);
          callback(otherTypingUsers);
        });
    },
    [],
  );

  const subscribeToUserStatus = useCallback(
    (
      userId: string,
      callback: (status: 'online' | 'offline', lastSeen?: Date) => void,
    ) => {
      return firestore()
        .collection('users')
        .doc(userId)
        .onSnapshot((doc: FirebaseFirestoreTypes.DocumentSnapshot) => {
          const data = doc.data();
          if (data) {
            callback(
              data.status || 'offline',
              data.lastSeen?.toDate() || undefined,
            );
          }
        });
    },
    [],
  );

  const subscribeToConversations = useCallback(
    (userId: string, callback: (conversations: Conversation[]) => void) => {
      return firestore()
        .collection('conversations')
        .where('participants', 'array-contains', userId)
        .onSnapshot((snapshot: FirebaseFirestoreTypes.QuerySnapshot) => {
          const conversations = snapshot.docs.map((doc: FirebaseFirestoreTypes.QueryDocumentSnapshot) => {
            const data = doc.data();
            return {
              id: doc.id,
              participants: data.participants,
              createdAt: firestoreTimestampToDate(data.createdAt),
              updatedAt: firestoreTimestampToDate(data.updatedAt),
              unreadCount: data.unreadCount || 0,
              lastMessage: data.lastMessage
                ? {
                    ...data.lastMessage,
                    timestamp: firestoreTimestampToDate(data.lastMessage.timestamp),
                  }
                : undefined,
            } as Conversation;
          });
          callback(conversations);
        });
    },
    [],
  );

  const actions = useMemo(
    () => ({
      initializeChat: (userId: string) => dispatch(initializeChat(userId)),
      updateUserStatus: (userId: string, status: 'online' | 'offline') =>
        dispatch(updateUserStatus({userId, status})),
      getUser: (userId: string) => dispatch(getUser(userId)),
      createConversation: (participants: string[]) =>
        dispatch(createConversation(participants)),
      getConversations: (userId: string) => dispatch(getConversations(userId)),
      sendMessage: (
        conversationId: string,
        message: Omit<ChatMessage, 'id' | 'timestamp' | 'status'> & {
          receiverId: string;
        },
      ) => dispatch(sendMessage({conversationId, message})),
      getMessages: (
        conversationId: string,
        limit?: number,
        lastMessageId?: string,
      ) => dispatch(getMessages({conversationId, limit, lastMessageId})),
      markConversationAsRead: (conversationId: string, userId: string) =>
        dispatch(markConversationAsRead({conversationId, userId})),
      uploadFile: (conversationId: string, uri: string, fileName: string) =>
        dispatch(uploadFile({conversationId, uri, fileName})),
      setTypingStatus: (
        conversationId: string,
        userId: string,
        isTyping: boolean,
      ) => dispatch(setTypingStatus({conversationId, userId, isTyping})),
      searchUsers: (query: string) => dispatch(searchUsers(query)),
      findConversation: (userId1: string, userId2: string) =>
        dispatch(findConversation({userId1, userId2})),
      setCurrentConversation: (conversation: Conversation | null) =>
        dispatch(setCurrentConversation(conversation)),
      addMessage: (message: ChatMessage) => dispatch(addMessage(message)),
      updateMessageStatus: (
        conversationId: string,
        messageId: string,
        status: 'delivered' | 'read',
      ) => dispatch(updateMessageStatus({conversationId, messageId, status})),
      setTypingUsers: (users: string[]) => dispatch(setTypingUsers(users)),
      clearMessages: () => dispatch(clearMessages()),
      clearError: () => dispatch(clearChatError()),
    }),
    [dispatch],
  );

  return useMemo(
    () => ({
      conversations,
      currentConversation,
      messages,
      users: users as {[key: string]: ChatUser},
      searchResults,
      typingUsers,
      loading,
      error,
      ...actions,
      subscribeToMessages,
      subscribeToTypingStatus,
      subscribeToUserStatus,
      subscribeToConversations,
    }),
    [
      conversations,
      currentConversation,
      messages,
      users,
      searchResults,
      typingUsers,
      loading,
      error,
      actions,
      subscribeToMessages,
      subscribeToTypingStatus,
      subscribeToUserStatus,
      subscribeToConversations,
    ],
  );
};
