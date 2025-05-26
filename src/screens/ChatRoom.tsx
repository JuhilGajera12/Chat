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

type Props = NativeStackScreenProps<RootStackParamList, 'ChatRoom'>;

const ChatRoom: React.FC<Props> = ({route, navigation}) => {
  const {conversationId, otherUserId, otherUserName} = route.params;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [userStatus, setUserStatus] = useState<{
    status: 'online' | 'offline';
    lastSeen: Date | null;
  }>({status: 'offline', lastSeen: null});
  const flatListRef = useRef<FlatList>(null);
  const appState = useRef(AppState.currentState);
  const currentUser = auth().currentUser;

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    // Set up message subscription
    const unsubscribeMessages = chatService.subscribeToMessages(
      conversationId,
      newMessages => {
        setMessages(newMessages);
        setLoading(false);
      },
    );

    // Set up typing status subscription
    const unsubscribeTyping = chatService.subscribeToTypingStatus(
      conversationId,
      users => {
        setTypingUsers(users.filter(id => id !== currentUser.uid));
      },
    );

    // Subscribe to other user's status
    const unsubscribeUserStatus = chatService.subscribeToUserStatus(
      otherUserId,
      (status, lastSeen) => {
        setUserStatus({status, lastSeen});
      },
    );

    // Update user status
    chatService.updateUserStatus(currentUser.uid, 'online');

    // Handle app state changes
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

    // Clean up subscriptions
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
    // TODO: Implement file/image attachment
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

  const renderMessage = ({item}: {item: ChatMessage}) => (
    <MessageBubble
      message={item}
      isOwnMessage={item.senderId === currentUser?.uid}
    />
  );

  const renderTypingIndicator = () => {
    if (typingUsers.length === 0) {
      return null;
    }

    return (
      <View style={styles.typingContainer}>
        <Text style={styles.typingText}>
          {typingUsers.length === 1
            ? `${otherUserName} is typing...`
            : 'Someone is typing...'}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primaryColor} />
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
          inverted
          onContentSizeChange={() =>
            flatListRef.current?.scrollToOffset({offset: 0})
          }
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
  },
  typingContainer: {
    paddingHorizontal: wp(4),
    paddingVertical: hp(1),
  },
  typingText: {
    fontFamily: fonts.italic,
    fontSize: fontSize(12),
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
});

export default ChatRoom;
