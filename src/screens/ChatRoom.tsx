import React, {useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  FlatList,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
  AppState,
} from 'react-native';
import {fonts} from '../constant/fonts';
import {fontSize, hp, wp} from '../helpers/globalFunction';
import {colors} from '../constant/colors';
import {icons} from '../constant/icons';
import {useChat, useAuth, useUI} from '../hooks';
import {ChatMessage} from '../types/chat';
import {RouteProp} from '@react-navigation/native';
import {RootStackParamList} from '../navigation/types';
import {useDispatch} from 'react-redux';
import {setMessages, setTypingUsers} from '../store/slices/chatSlice';

type Props = {
  route: RouteProp<RootStackParamList, 'ChatRoom'>;
};

const ChatRoom: React.FC<Props> = ({route}) => {
  const {conversationId, otherUserName} = route.params;
  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);
  const appState = useRef(AppState.currentState);
  const [messageText, setMessageText] = React.useState('');
  const [isLoadingMore, setIsLoadingMore] = React.useState(false);
  const [hasMoreMessages, setHasMoreMessages] = React.useState(true);

  const {
    chatRoom: {typingUsers},
    resetChatRoom,
  } = useUI();

  const {
    sendMessage,
    setTypingStatus,
    updateUserStatus,
    markConversationAsRead,
    messages,
    loading,
    error,
    getMessages,
    updateMessageStatus,
    subscribeToMessages,
    subscribeToTypingStatus,
  } = useChat();

  const {user: currentUser} = useAuth();

  const dispatch = useDispatch();

  useEffect(() => {
    if (!conversationId) return;

    const unsubscribe = subscribeToMessages(
      conversationId,
      (newMessages: ChatMessage[]) => {
        const sortedMessages = [...newMessages].sort(
          (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
        );
        dispatch(setMessages(sortedMessages));
      },
    );

    return () => {
      unsubscribe();
    };
  }, [conversationId, subscribeToMessages, dispatch]);

  useEffect(() => {
    if (conversationId && currentUser) {
      loadMessages();
      markConversationAsRead(conversationId, currentUser.uid);
      
      messages.forEach(message => {
        if (message.senderId !== currentUser.uid && message.status !== 'read') {
          updateMessageStatus(conversationId, message.id, 'read');
        }
      });
    }
  }, [conversationId, currentUser, markConversationAsRead, messages, updateMessageStatus]);

  useEffect(() => {
    if (!conversationId || !currentUser) return;

    const unreadMessages = messages.filter(
      message => 
        message.senderId !== currentUser.uid && 
        message.status !== 'read' &&
        (new Date().getTime() - message.timestamp.getTime()) < 5 * 60 * 1000
    );

    if (unreadMessages.length > 0) {
      markConversationAsRead(conversationId, currentUser.uid);
      
      unreadMessages.forEach(message => {
        updateMessageStatus(conversationId, message.id, 'read');
      });
    }
  }, [conversationId, currentUser, messages, markConversationAsRead, updateMessageStatus]);

  useEffect(() => {
    if (!conversationId || !currentUser) return;

    const unsubscribeTyping = subscribeToTypingStatus(
      conversationId,
      (typingUsers) => {
        dispatch(setTypingUsers(typingUsers));
      },
      currentUser.uid
    );

    return () => {
      unsubscribeTyping();
    };
  }, [conversationId, currentUser, subscribeToTypingStatus, dispatch]);

  const loadMessages = async (lastMessageId?: string) => {
    if (!hasMoreMessages || isLoadingMore) return;

    setIsLoadingMore(true);
    try {
      const result = await getMessages(conversationId, 20, lastMessageId);
      if (result.payload && Array.isArray(result.payload)) {
        const newMessages = result.payload as ChatMessage[];
        setHasMoreMessages(newMessages.length === 20);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (messages.length > 0 && !isLoadingMore && hasMoreMessages) {
      const lastMessage = messages[messages.length - 1];
      loadMessages(lastMessage.id);
    }
  };

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        if (currentUser) {
          updateUserStatus(currentUser.uid, 'online');
        }
      } else if (nextAppState.match(/inactive|background/)) {
        if (currentUser) {
          updateUserStatus(currentUser.uid, 'offline');
        }
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
      resetChatRoom();
    };
  }, [currentUser, updateUserStatus, resetChatRoom]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || !currentUser) return;

    try {
      const messagePayload: Omit<ChatMessage, 'id' | 'timestamp' | 'status'> & {
        receiverId: string;
      } = {
        senderId: currentUser.uid,
        text: text.trim(),
        type: 'text',
        conversationId,
        receiverId: route.params.otherUserId,
      };

      const result = await sendMessage(conversationId, messagePayload);
      if (
        result.meta.requestStatus === 'fulfilled' &&
        result.payload &&
        typeof result.payload === 'object' &&
        'message' in result.payload &&
        result.payload.message &&
        typeof result.payload.message === 'object' &&
        'id' in result.payload.message &&
        typeof result.payload.message.id === 'string'
      ) {
        updateMessageStatus(
          conversationId,
          result.payload.message.id,
          'delivered',
        );
      }
      setMessageText('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleTyping = (isTyping: boolean) => {
    if (!currentUser) return;
    setTypingStatus(conversationId, currentUser.uid, isTyping);
  };

  const handleSendButtonPress = () => {
    if (messageText.trim()) {
      handleSendMessage(messageText);
    }
  };

  const renderMessage = ({item}: {item: ChatMessage}) => {
    const isCurrentUser = item.senderId === currentUser?.uid;

    return (
      <View
        style={[
          styles.messageContainer,
          isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage,
        ]}>
        <View
          style={[
            styles.messageBubble,
            isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble,
          ]}>
          <Text
            style={[
              styles.messageText,
              isCurrentUser
                ? styles.currentUserMessageText
                : styles.otherUserMessageText,
            ]}>
            {item.text}
          </Text>
          <View style={styles.messageFooter}>
            <Text style={styles.messageTime}>
              {new Date(item.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderFooter = () => {
    if (!isLoadingMore) return null;
    return (
      <View style={styles.loadingMoreContainer}>
        <ActivityIndicator size="small" color={colors.primaryColor} />
      </View>
    );
  };

  if (loading && !isLoadingMore) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primaryColor} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          {error.message || 'An error occurred'}
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={colors.white}
        translucent
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          inverted
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          contentContainerStyle={styles.messagesList}
        />

        {typingUsers.length > 0 && (
          <View style={styles.typingContainer}>
            <Text style={styles.typingText}>
              {typingUsers.length === 1
                ? `${otherUserName} is typing...`
                : 'Multiple people are typing...'}
            </Text>
          </View>
        )}

        <View style={styles.inputContainer}>
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor={colors.placeHolder}
            multiline
            maxLength={1000}
            value={messageText}
            onChangeText={text => {
              setMessageText(text);
              if (text.length > 0) {
                handleTyping(true);
              } else {
                handleTyping(false);
              }
            }}
            onSubmitEditing={e => {
              handleSendMessage(e.nativeEvent.text);
            }}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              !messageText.trim() && styles.sendButtonDisabled,
            ]}
            onPress={handleSendButtonPress}
            disabled={!messageText.trim()}>
            <Image
              source={icons.send}
              style={[
                styles.sendIcon,
                !messageText.trim() && styles.sendIconDisabled,
              ]}
              tintColor={
                messageText.trim() ? colors.primaryColor : colors.placeHolder
              }
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp(6),
  },
  errorText: {
    fontFamily: fonts.regular,
    fontSize: fontSize(16),
    color: colors.error,
    textAlign: 'center',
  },
  header: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(4),
    paddingVertical: hp(2),
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: wp(3),
  },
  avatar: {
    width: wp(12),
    height: wp(12),
    borderRadius: wp(6),
  },
  avatarPlaceholder: {
    backgroundColor: colors.primaryColor,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontFamily: fonts.bold,
    fontSize: fontSize(20),
    color: colors.white,
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: wp(3),
    height: wp(3),
    borderRadius: wp(1.5),
    borderWidth: 1.5,
    borderColor: colors.white,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontFamily: fonts.bold,
    fontSize: fontSize(16),
    color: colors.black,
    marginBottom: hp(0.5),
  },
  userStatus: {
    fontFamily: fonts.regular,
    fontSize: fontSize(14),
    color: colors.placeHolder,
  },
  keyboardView: {
    flex: 1,
  },
  messagesContainer: {
    flexGrow: 1,
    paddingHorizontal: wp(4),
    paddingVertical: hp(2),
    flexDirection: 'column-reverse',
  },
  messageContainer: {
    marginBottom: hp(2),
    maxWidth: '80%',
  },
  currentUserMessage: {
    alignSelf: 'flex-end',
  },
  otherUserMessage: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    borderRadius: hp(2),
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
  },
  currentUserBubble: {
    backgroundColor: colors.primaryColor,
  },
  otherUserBubble: {
    backgroundColor: colors.inputBackground,
  },
  messageText: {
    fontFamily: fonts.regular,
    fontSize: fontSize(16),
    lineHeight: fontSize(22),
  },
  currentUserMessageText: {
    color: colors.white,
  },
  otherUserMessageText: {
    color: colors.black,
  },
  messageTime: {
    fontFamily: fonts.regular,
    fontSize: fontSize(12),
    color: colors.placeHolder,
    marginTop: hp(0.5),
    alignSelf: 'flex-end',
  },
  typingContainer: {
    paddingHorizontal: wp(4),
    paddingVertical: hp(1),
  },
  typingText: {
    fontFamily: fonts.regular,
    fontSize: fontSize(14),
    color: colors.placeHolder,
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(4),
    paddingVertical: hp(2),
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.white,
  },
  input: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: fontSize(16),
    color: colors.black,
    backgroundColor: colors.inputBackground,
    borderRadius: hp(2),
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
    maxHeight: hp(12),
  },
  sendButton: {
    width: wp(12),
    height: wp(12),
    borderRadius: wp(6),
    backgroundColor: colors.inputBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: wp(2),
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendIcon: {
    width: wp(5),
    height: wp(5),
  },
  sendIconDisabled: {
    opacity: 0.5,
  },
  loadingMoreContainer: {
    paddingVertical: hp(2),
    alignItems: 'center',
  },
  messagesList: {
    flexGrow: 1,
    paddingHorizontal: wp(4),
    paddingBottom: hp(2),
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: hp(0.5),
  },
  statusIcon: {
    width: wp(4),
    height: wp(4),
    marginLeft: wp(1),
  },
  doubleTickContainer: {
    flexDirection: 'row',
  },
  secondTick: {
    marginLeft: -wp(2.5),
  },
});

export default React.memo(ChatRoom);
