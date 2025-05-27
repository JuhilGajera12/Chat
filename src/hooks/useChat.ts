import {useCallback} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {
  searchUsers,
  findConversation,
  createConversation,
  sendMessage,
  setTypingStatus,
  updateUserStatus,
  markConversationAsRead,
  selectChat,
} from '../store/slices/chatSlice';
import {AppDispatch} from '../store/store';
import firestore from '@react-native-firebase/firestore';
import {ChatMessage, Conversation} from '../types/chat';

export const useChat = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {messages, users, conversations, loading, error} =
    useSelector(selectChat);

  const searchUsersAction = useCallback(
    (query: string) => {
      return dispatch(searchUsers(query));
    },
    [dispatch],
  );

  const findConversationAction = useCallback(
    (userId1: string, userId2: string) => {
      return dispatch(findConversation({userId1, userId2}));
    },
    [dispatch],
  );

  const createConversationAction = useCallback(
    (participants: string[]) => {
      return dispatch(createConversation(participants));
    },
    [dispatch],
  );

  const sendMessageAction = useCallback(
    (
      conversationId: string,
      message: Omit<ChatMessage, 'id' | 'timestamp' | 'status'>,
    ) => {
      return dispatch(sendMessage({conversationId, message}));
    },
    [dispatch],
  );

  const setTypingStatusAction = useCallback(
    (conversationId: string, userId: string, isTyping: boolean) => {
      return dispatch(setTypingStatus({conversationId, userId, isTyping}));
    },
    [dispatch],
  );

  const updateUserStatusAction = useCallback(
    (userId: string, status: 'online' | 'offline') => {
      return dispatch(updateUserStatus({userId, status}));
    },
    [dispatch],
  );

  const markConversationAsReadAction = useCallback(
    (conversationId: string, userId: string) => {
      return dispatch(markConversationAsRead({conversationId, userId}));
    },
    [dispatch],
  );

  const subscribeToMessages = useCallback(
    (conversationId: string, callback: (messages: ChatMessage[]) => void) => {
      return firestore()
        .collection('conversations')
        .doc(conversationId)
        .collection('messages')
        .orderBy('timestamp', 'desc')
        .onSnapshot(snapshot => {
          const messages = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp?.toDate() || new Date(),
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
        .onSnapshot(snapshot => {
          const users = snapshot.docs.map(doc => doc.id);
          const otherTypingUsers = users.filter(id => id !== currentUserId);
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
        .onSnapshot(doc => {
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
        .onSnapshot(snapshot => {
          const conversations = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              participants: data.participants,
              createdAt: data.createdAt?.toDate() || new Date(),
              updatedAt: data.updatedAt?.toDate() || new Date(),
              unreadCount: data.unreadCount || 0,
              lastMessage: data.lastMessage
                ? {
                    ...data.lastMessage,
                    timestamp:
                      data.lastMessage.timestamp?.toDate() || new Date(),
                  }
                : undefined,
            } as Conversation;
          });
          callback(conversations);
        });
    },
    [],
  );

  return {
    messages,
    users,
    conversations,
    loading,
    error,
    searchUsers: searchUsersAction,
    findConversation: findConversationAction,
    createConversation: createConversationAction,
    sendMessage: sendMessageAction,
    setTypingStatus: setTypingStatusAction,
    updateUserStatus: updateUserStatusAction,
    markConversationAsRead: markConversationAsReadAction,
    subscribeToMessages,
    subscribeToTypingStatus,
    subscribeToUserStatus,
    subscribeToConversations,
  };
};
