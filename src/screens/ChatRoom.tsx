import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
  Text,
  AppState,
  Image,
} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/types';
import {colors} from '../constant/colors';
import {fonts} from '../constant/fonts';
import {fontSize, hp, wp} from '../helpers/globalFunction';
import {chatService} from '../services/chat';
import {ChatMessage} from '../types/chat';
import MessageBubble from '../components/MessageBubble';
import ChatInput from '../components/ChatInput';
import auth from '@react-native-firebase/auth';
import {formatLastSeen} from '../utils/dateUtils';
import {icons} from '../constant/icons';

type Props = NativeStackScreenProps<RootStackParamList, 'ChatRoom'>;

const ChatRoom: React.FC<Props> = ({route, navigation}) => {
  const {conversationId, otherUserId, otherUserName} = route.params;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [userStatus, setUserStatus] = useState({
    status: 'offline' as 'online' | 'offline',
    lastSeen: null as Date | null,
  });

  const flatListRef = useRef<FlatList>(null);
  const appState = useRef(AppState.currentState);
  const currentUser = auth().currentUser;
  const [selectedMessage, setSelectedMessage] = useState<ChatMessage | null>(
    null,
  );

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    const unsubscribeMessages = chatService.subscribeToMessages(
      conversationId,
      newMessages => {
        const sortedMessages = [...newMessages].sort(
          (a, b) => b.timestamp - a.timestamp,
        );
        setMessages(sortedMessages);
        setLoading(false);

        if (sortedMessages.length > 0) {
        }
      },
    );

    const unsubscribeTyping = chatService.subscribeToTypingStatus(
      conversationId,
      users => {
        const otherTypingUsers = users.filter(id => id !== currentUser.uid);
        setTypingUsers(otherTypingUsers);

        if (otherTypingUsers.length > 0) {
          // No need to animate typing indicator
        }
      },
    );

    const unsubscribeUserStatus = chatService.subscribeToUserStatus(
      otherUserId,
      (status, lastSeen) => {
        setUserStatus({status, lastSeen});
      },
    );

    chatService.updateUserStatus(currentUser.uid, 'online');
    chatService.markConversationAsRead(conversationId, currentUser.uid);

    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        chatService.updateUserStatus(currentUser.uid, 'online');
      } else if (nextAppState.match(/inactive|background/)) {
        chatService.updateUserStatus(currentUser.uid, 'offline');
      }
      appState.current = nextAppState;
    });

    return () => {
      unsubscribeMessages();
      unsubscribeTyping();
      unsubscribeUserStatus();
      subscription.remove();
      chatService.updateUserStatus(currentUser.uid, 'offline');
    };
  }, [conversationId, currentUser, otherUserId]);

  useEffect(() => {
    navigation.setOptions({
      title: otherUserName,
      headerRight: () => (
        <View style={styles.headerRight}>
          <Text style={styles.statusText}>
            {userStatus.status === 'online'
              ? 'Online'
              : formatLastSeen(userStatus.lastSeen)}
          </Text>
          <View
            style={[
              styles.statusIndicator,
              {
                backgroundColor:
                  userStatus.status === 'online'
                    ? colors.success
                    : colors.placeHolder,
              },
            ]}
          />
        </View>
      ),
    });
  }, [navigation, otherUserName, userStatus]);

  const handleSendMessage = async (text: string) => {
    if (!currentUser) {
      return;
    }
    try {
      await chatService.sendMessage(conversationId, {
        senderId: currentUser.uid,
        receiverId: otherUserId,
        text,
        type: 'text',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to send message');
    }
  };

  const handleAttachmentPress = () => {
    Alert.alert(
      'Coming Soon',
      'File attachment feature will be available soon!',
    );
  };

  const handleTyping = async (isTyping: boolean) => {
    if (!currentUser) {
      return;
    }
    try {
      await chatService.setTypingStatus(
        conversationId,
        currentUser.uid,
        isTyping,
      );
    } catch (error) {
      console.error('Error setting typing status:', error);
    }
  };

  const handleMessageLongPress = (message: ChatMessage) => {
    setSelectedMessage(message);
  };

  const renderMessage = ({item}: {item: ChatMessage}) => {
    return (
      <View>
        <MessageBubble
          message={item}
          isOwnMessage={item.senderId === currentUser?.uid}
          onLongPress={() => handleMessageLongPress(item)}
        />
      </View>
    );
  };

  const renderTypingIndicator = () => {
    if (typingUsers.length === 0) {
      return null;
    }

    return (
      <View style={styles.typingContainer}>
        <View style={styles.typingBubble}>
          <View style={styles.typingDots}>
            {[0, 1, 2].map(i => (
              <View key={i} style={styles.typingDot} />
            ))}
          </View>
          <Text style={styles.typingText}>
            {typingUsers.length === 1
              ? `${otherUserName} is typing`
              : 'Someone is typing'}
          </Text>
        </View>
      </View>
    );
  };

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Image
        source={icons.emptyChat}
        style={styles.emptyIcon}
        resizeMode="contain"
      />
      <Text style={styles.emptyText}>No messages yet</Text>
      <Text style={styles.emptySubText}>
        Start the conversation by sending a message
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View>
          <ActivityIndicator size="large" color={colors.primaryColor} />
        </View>
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
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? hp(8) : 0}>
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.messageList}
          inverted={false}
          onContentSizeChange={() => {
            if (messages.length > 0) {
              flatListRef.current?.scrollToEnd({animated: false});
            }
          }}
          ListEmptyComponent={renderEmptyComponent}
          showsVerticalScrollIndicator={false}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
        />
        {renderTypingIndicator()}
        <ChatInput
          onSendMessage={handleSendMessage}
          onAttachmentPress={handleAttachmentPress}
          onTyping={handleTyping}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  keyboardView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  messageList: {
    paddingHorizontal: wp(4),
    paddingVertical: hp(2),
    flexGrow: 1,
    flexDirection: 'column-reverse',
  },
  dateSeparator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: hp(2),
    paddingHorizontal: wp(2),
  },
  dateSeparatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dateSeparatorText: {
    fontFamily: fonts.regular,
    fontSize: fontSize(12),
    color: colors.placeHolder,
    marginHorizontal: wp(2),
  },
  typingContainer: {
    paddingHorizontal: wp(4),
    paddingVertical: hp(1),
  },
  typingBubble: {
    backgroundColor: colors.inputBackground,
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
    borderRadius: hp(2),
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingDots: {
    flexDirection: 'row',
    marginRight: wp(2),
  },
  typingDot: {
    width: wp(1.5),
    height: wp(1.5),
    borderRadius: wp(0.75),
    backgroundColor: colors.primaryColor,
    marginHorizontal: wp(0.5),
  },
  typingText: {
    fontFamily: fonts.regular,
    fontSize: fontSize(13),
    color: colors.placeHolder,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: wp(4),
  },
  statusText: {
    fontFamily: fonts.regular,
    fontSize: fontSize(12),
    color: colors.placeHolder,
    marginRight: wp(2),
  },
  statusIndicator: {
    width: wp(2),
    height: wp(2),
    borderRadius: wp(1),
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: hp(10),
    paddingHorizontal: wp(4),
  },
  emptyIcon: {
    width: wp(40),
    height: wp(40),
    marginBottom: hp(2),
    opacity: 0.5,
  },
  emptyText: {
    fontFamily: fonts.bold,
    fontSize: fontSize(18),
    color: colors.black,
    marginBottom: hp(1),
    textAlign: 'center',
  },
  emptySubText: {
    fontFamily: fonts.regular,
    fontSize: fontSize(14),
    color: colors.placeHolder,
    textAlign: 'center',
  },
});

export default ChatRoom;
