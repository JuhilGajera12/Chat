import React, {useEffect, useCallback, useMemo, memo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Platform,
  Alert,
} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/types';
import {colors} from '../constant/colors';
import {fonts} from '../constant/fonts';
import {fontSize, hp, navigate, wp} from '../helpers/globalFunction';
import {Conversation, ChatUser} from '../types/chat';
import auth from '@react-native-firebase/auth';
import {icons} from '../constant/icons';
import {formatConversationTime} from '../utils/dateUtils';
import {useChat, useSession} from '../hooks/useRedux';
import {useFocusEffect} from '@react-navigation/native';

type Props = NativeStackScreenProps<RootStackParamList, 'ChatList'>;

const ConversationItem = memo(
  ({
    conversation,
    otherUser,
    currentUserId,
    onPress,
  }: {
    conversation: Conversation;
    otherUser: ChatUser;
    currentUserId: string;
    onPress: (conversation: Conversation) => void;
  }) => {
    const lastMessageTime = useMemo(
      () =>
        conversation.lastMessage?.timestamp
          ? formatConversationTime(conversation.lastMessage.timestamp)
          : '',
      [conversation.lastMessage?.timestamp],
    );

    const unreadCount = useMemo(
      () => conversation.unreadCount[currentUserId] || 0,
      [conversation.unreadCount, currentUserId],
    );

    return (
      <TouchableOpacity
        style={styles.conversationItem}
        onPress={() => onPress(conversation)}
        activeOpacity={0.7}>
        <View style={styles.avatarContainer}>
          {otherUser.photoURL ? (
            <Image source={{uri: otherUser.photoURL}} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarText}>
                {otherUser.displayName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          {otherUser.status === 'online' && (
            <View style={styles.onlineIndicator} />
          )}
        </View>

        <View style={styles.conversationInfo}>
          <View style={styles.nameTimeContainer}>
            <Text style={styles.name} numberOfLines={1}>
              {otherUser.displayName}
            </Text>
            {lastMessageTime && (
              <Text style={styles.time}>{lastMessageTime}</Text>
            )}
          </View>

          <View style={styles.messageContainer}>
            <Text
              style={[
                styles.lastMessage,
                unreadCount > 0 && styles.unreadMessage,
              ]}
              numberOfLines={1}
              ellipsizeMode="tail">
              {conversation.lastMessage?.text || 'No messages yet'}
            </Text>
            {unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadCount}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  },
);

const EmptyState = memo(() => (
  <View style={styles.emptyContainer}>
    <Image
      source={icons.emptyChat}
      style={styles.emptyIcon}
      resizeMode="contain"
    />
    <Text style={styles.emptyText}>No conversations yet</Text>
    <Text style={styles.emptySubText}>
      Start a new chat by tapping the button above
    </Text>
    <TouchableOpacity
      style={styles.startChatButton}
      onPress={() => navigate('UserDiscovery')}
      activeOpacity={0.7}>
      <Text style={styles.startChatButtonText}>Start a Chat</Text>
    </TouchableOpacity>
  </View>
));

const ChatList: React.FC<Props> = () => {
  const currentUser = auth().currentUser;
  const {conversations, users, loading, initializeChat} = useChat();
  const {handleLogout} = useSession();

  const getOtherUser = useCallback(
    (conversation: Conversation) => {
      const otherUserId = conversation.participants.find(
        id => id !== currentUser?.uid,
      );
      if (!otherUserId) return null;
      return (users as {[key: string]: ChatUser})[otherUserId] || null;
    },
    [users, currentUser?.uid],
  );

  const handleConversationPress = useCallback(
    (conversation: Conversation) => {
      const otherUser = getOtherUser(conversation);
      if (!otherUser) return;

      navigate('ChatRoom', {
        conversationId: conversation.id,
        otherUserId: otherUser.id,
        otherUserName: otherUser.displayName,
      });
    },
    [getOtherUser],
  );

  const handleLogoutPress = useCallback(async () => {
    try {
      await handleLogout();
    } catch {
      Alert.alert('Error', 'Failed to logout');
    }
  }, [handleLogout]);

  const renderConversation = useCallback(
    ({item}: {item: Conversation}) => {
      const otherUser = getOtherUser(item);
      if (!otherUser) return null;

      return (
        <ConversationItem
          conversation={item}
          otherUser={otherUser}
          currentUserId={currentUser?.uid || ''}
          onPress={handleConversationPress}
        />
      );
    },
    [getOtherUser, currentUser?.uid, handleConversationPress],
  );

  const keyExtractor = useCallback(
    (item: Conversation) =>
      item.id || `conversation-${item.participants.join('-')}`,
    [],
  );

  useFocusEffect(
    useCallback(() => {
      if (currentUser) {
        initializeChat(currentUser.uid).catch(error =>
          console.error('Error initializing chat:', error),
        );
      }
    }, [currentUser, initializeChat]),
  );

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
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Messages</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogoutPress}
              activeOpacity={0.7}>
              <Image
                source={icons.logout}
                style={styles.logoutIcon}
                tintColor={colors.primaryColor}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.newChatButton}
              onPress={() => navigate('UserDiscovery')}
              activeOpacity={0.7}>
              <Image
                source={icons.user}
                style={styles.newChatIcon}
                tintColor={colors.white}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <FlatList
        data={conversations}
        renderItem={renderConversation}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={true}
        updateCellsBatchingPeriod={50}
        ListEmptyComponent={EmptyState}
      />
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
    backgroundColor: colors.white,
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
  title: {
    fontFamily: fonts.bold,
    fontSize: fontSize(24),
    color: colors.black,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(3),
  },
  logoutButton: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.primaryColor,
  },
  logoutIcon: {
    width: wp(5),
    height: wp(5),
  },
  newChatButton: {
    backgroundColor: colors.primaryColor,
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primaryColor,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  newChatIcon: {
    width: wp(5),
    height: wp(5),
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: hp(2),
  },
  conversationItem: {
    flexDirection: 'row',
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
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
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: wp(3),
    height: wp(3),
    borderRadius: wp(1.5),
    backgroundColor: colors.success,
    borderWidth: 1.5,
    borderColor: colors.white,
  },
  conversationInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  nameTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(0.5),
  },
  name: {
    fontFamily: fonts.bold,
    fontSize: fontSize(16),
    color: colors.black,
    flex: 1,
    marginRight: wp(2),
  },
  time: {
    fontFamily: fonts.regular,
    fontSize: fontSize(12),
    color: colors.placeHolder,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lastMessage: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: fontSize(14),
    color: colors.placeHolder,
    marginRight: wp(2),
  },
  unreadMessage: {
    fontFamily: fonts.bold,
    color: colors.black,
  },
  unreadBadge: {
    backgroundColor: colors.primaryColor,
    minWidth: wp(5),
    height: wp(5),
    borderRadius: wp(2.5),
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp(1),
  },
  unreadCount: {
    fontFamily: fonts.bold,
    fontSize: fontSize(10),
    color: colors.white,
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
    marginBottom: hp(3),
    textAlign: 'center',
  },
  startChatButton: {
    backgroundColor: colors.primaryColor,
    paddingHorizontal: wp(6),
    paddingVertical: hp(1.5),
    borderRadius: hp(1),
    shadowColor: colors.primaryColor,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  startChatButtonText: {
    fontFamily: fonts.bold,
    fontSize: fontSize(14),
    color: colors.white,
  },
});

export default memo(ChatList);
