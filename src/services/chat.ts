import firestore, {
  FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import {ChatMessage, Conversation, ChatUser} from '../types/chat';
import moment from 'moment';

const MESSAGES_COLLECTION = 'messages';
const CONVERSATIONS_COLLECTION = 'conversations';
const USERS_COLLECTION = 'users';

const toMoment = (timestamp: any): moment.Moment => {
  if (timestamp instanceof FirebaseFirestoreTypes.Timestamp) {
    return moment(timestamp.toDate());
  }
  if (timestamp instanceof Date) {
    return moment(timestamp);
  }
  if (typeof timestamp === 'number') {
    return moment(timestamp);
  }
  return moment();
};

export const chatService = {
  async updateUserStatus(userId: string, status: 'online' | 'offline') {
    try {
      const userRef = firestore().collection(USERS_COLLECTION).doc(userId);
      await userRef.update({
        status,
        lastSeen:
          status === 'offline' ? firestore.FieldValue.serverTimestamp() : null,
      });
    } catch (error) {
      console.error('Error updating user status:', error);
      throw error;
    }
  },

  async getUser(userId: string): Promise<ChatUser | null> {
    try {
      const userDoc = await firestore()
        .collection(USERS_COLLECTION)
        .doc(userId)
        .get();
      return userDoc.exists() ? (userDoc.data() as ChatUser) : null;
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  },

  subscribeToUserStatus(
    userId: string,
    callback: (status: 'online' | 'offline', lastSeen: Date | null) => void,
  ) {
    return firestore()
      .collection(USERS_COLLECTION)
      .doc(userId)
      .onSnapshot(doc => {
        const data = doc.data();

        if (data) {
          const lastSeenRaw = data.lastSeen;
          let lastSeen: Date | null = null;

          if (lastSeenRaw && typeof lastSeenRaw.toDate === 'function') {
            lastSeen = lastSeenRaw.toDate();
          }

          callback(data.status, lastSeen);
        }
      });
  },

  async createConversation(participants: string[]): Promise<string> {
    try {
      const conversationRef = await firestore()
        .collection(CONVERSATIONS_COLLECTION)
        .add({
          participants,
          createdAt: firestore.FieldValue.serverTimestamp(),
          updatedAt: firestore.FieldValue.serverTimestamp(),
          unreadCount: 0,
        });
      return conversationRef.id;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  },

  async getConversations(userId: string): Promise<Conversation[]> {
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
    } catch (error) {
      console.error('Error getting conversations:', error);
      throw error;
    }
  },

  async sendMessage(
    conversationId: string,
    message: Omit<ChatMessage, 'id' | 'timestamp' | 'status'>,
  ): Promise<string> {
    try {
      const batch = firestore().batch();
      const conversationRef = firestore()
        .collection(CONVERSATIONS_COLLECTION)
        .doc(conversationId);
      const messageRef = conversationRef.collection(MESSAGES_COLLECTION).doc();
      const now = moment().valueOf();

      batch.set(messageRef, {
        ...message,
        timestamp: now,
        status: 'sent',
      });

      batch.update(conversationRef, {
        lastMessage: {
          ...message,
          id: messageRef.id,
          timestamp: now,
          status: 'sent',
        },
        updatedAt: now,
        [`unreadCount.${message.receiverId}`]:
          firestore.FieldValue.increment(1),
      });

      await batch.commit();
      return messageRef.id;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  async getMessages(
    conversationId: string,
    limit: number = 20,
    lastMessageId?: string,
  ): Promise<ChatMessage[]> {
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
      return snapshot?.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as ChatMessage[];
    } catch (error) {
      console.error('Error getting messages:', error);
      throw error;
    }
  },

  async markConversationAsRead(conversationId: string, userId: string) {
    try {
      await firestore()
        .collection(CONVERSATIONS_COLLECTION)
        .doc(conversationId)
        .update({
          [`unreadCount.${userId}`]: 0,
        });
    } catch (error) {
      console.error('Error marking conversation as read:', error);
      throw error;
    }
  },

  async uploadFile(
    conversationId: string,
    uri: string,
    fileName: string,
  ): Promise<string> {
    try {
      const reference = storage().ref(`chats/${conversationId}/${fileName}`);
      await reference.putFile(uri);
      const url = await reference.getDownloadURL();
      return url;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  },

  subscribeToMessages(
    conversationId: string,
    callback: (messages: ChatMessage[]) => void,
  ) {
    return firestore()
      .collection(CONVERSATIONS_COLLECTION)
      .doc(conversationId)
      .collection(MESSAGES_COLLECTION)
      .orderBy('timestamp', 'desc')
      .limit(50)
      .onSnapshot(snapshot => {
        const messages = snapshot?.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as ChatMessage[];
        callback(messages);
      });
  },

  subscribeToConversations(
    userId: string,
    callback: (conversations: Conversation[]) => void,
  ) {
    const query = firestore()
      .collection(CONVERSATIONS_COLLECTION)
      .where('participants', 'array-contains', userId)
      .orderBy('updatedAt', 'desc');

    return query.onSnapshot(
      snapshot => {
        if (snapshot.empty) {
          callback([]);
          return;
        }

        Promise.all(
          snapshot.docs.map(async doc => {
            try {
              const data = doc.data();
              if (!data || !Array.isArray(data.participants)) {
                return null;
              }

              const otherUserId = data.participants.find(
                (id: string) => id !== userId,
              );
              if (!otherUserId) return null;

              const updatedAt = toMoment(data.updatedAt).valueOf();
              const createdAt = toMoment(data.createdAt).valueOf();
              const otherUser = await this.getUser(otherUserId);

              let lastMessage = data.lastMessage;
              if (lastMessage) {
                lastMessage = {
                  ...lastMessage,
                  timestamp: toMoment(lastMessage.timestamp).valueOf(),
                };
              }

              const conversation = {
                id: doc.id,
                participants: data.participants,
                updatedAt,
                createdAt,
                unreadCount: data.unreadCount || {},
                lastMessage: lastMessage || undefined,
                otherUser: otherUser || undefined,
              } satisfies Partial<Conversation>;

              if (
                conversation.id &&
                conversation.participants &&
                conversation.updatedAt &&
                conversation.createdAt &&
                conversation.unreadCount
              ) {
                return conversation as Conversation;
              }
              return null;
            } catch (error) {
              console.error('Error processing conversation:', doc.id, error);
              return null;
            }
          }),
        )
          .then(conversations => {
            const validConversations = conversations.filter(
              (conv): conv is Conversation => conv !== null,
            );
            callback(validConversations);
          })
          .catch(error => {
            console.error('Error in conversation processing:', error);
            callback([]);
          });
      },
      error => {
        console.error('Error in conversation subscription:', error);
        callback([]);
      },
    );
  },

  async setTypingStatus(
    conversationId: string,
    userId: string,
    isTyping: boolean,
  ) {
    try {
      const typingRef = firestore()
        .collection(CONVERSATIONS_COLLECTION)
        .doc(conversationId)
        .collection('typing')
        .doc(userId);

      if (isTyping) {
        await typingRef.set({
          userId,
          timestamp: firestore.FieldValue.serverTimestamp(),
        });
      } else {
        await typingRef.delete();
      }
    } catch (error) {
      console.error('Error setting typing status:', error);
      throw error;
    }
  },

  subscribeToTypingStatus(
    conversationId: string,
    callback: (typingUsers: string[]) => void,
  ) {
    return firestore()
      .collection(CONVERSATIONS_COLLECTION)
      .doc(conversationId)
      .collection('typing')
      .onSnapshot(snapshot => {
        const typingUsers = snapshot?.docs.map(doc => doc.data().userId);
        callback(typingUsers);
      });
  },

  async searchUsers(query: string): Promise<ChatUser[]> {
    try {
      const snapshot = await firestore()
        .collection(USERS_COLLECTION)
        .where('displayName', '>=', query)
        .where('displayName', '<=', query + '\uf8ff')
        .limit(20)
        .get();

      return snapshot?.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as ChatUser[];
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  },

  async findConversation(
    userId1: string,
    userId2: string,
  ): Promise<Conversation | null> {
    try {
      const snapshot = await firestore()
        .collection(CONVERSATIONS_COLLECTION)
        .where('participants', 'array-contains', userId1)
        .get();

      const conversation = snapshot?.docs.find(doc => {
        const data = doc.data();
        return data.participants.includes(userId2);
      });

      if (!conversation) return null;

      const data = conversation.data();
      return {
        id: conversation.id,
        participants: data.participants,
        unreadCount: data.unreadCount || 0,
        updatedAt: data.updatedAt,
        createdAt: data.createdAt,
        lastMessage: data.lastMessage,
      } as Conversation;
    } catch (error) {
      console.error('Error finding conversation:', error);
      throw error;
    }
  },
};
