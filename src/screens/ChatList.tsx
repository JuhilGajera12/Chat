import React, {useEffect, useState} from 'react';
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
} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/types';
import {colors} from '../constant/colors';
import {fonts} from '../constant/fonts';
import {fontSize, hp, wp} from '../helpers/globalFunction';
import {chatService} from '../services/chat';
import {Conversation, ChatUser} from '../types/chat';
import auth from '@react-native-firebase/auth';
import {icons} from '../constant/icons';
import {formatConversationTime} from '../utils/dateUtils';

type Props = NativeStackScreenProps<RootStackParamList, 'ChatList'>;

const ChatList: React.FC<Props> = ({navigation}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<{[key: string]: ChatUser}>({});
  const currentUser = auth().currentUser;

  useEffect(() => {
    if (!currentUser) {
      console.log('No current user found');
      setLoading(false);
      return;
    }

    console.log('Setting up conversation subscription for user:', currentUser.uid);
    
    const unsubscribeConversations = chatService.subscribeToConversations(
      currentUser.uid,
      async newConversations => {
        try {
          console.log('Received conversations:', newConversations.length);
          setConversations(newConversations);
          
          const userIds = new Set<string>();
          newConversations.forEach(conversation => {
            conversation.participants.forEach(id => {
              if (id !== currentUser.uid) {
                userIds.add(id);
              }
            });
          });

          console.log('Fetching user data for:', Array.from(userIds));
          const userPromises = Array.from(userIds).map(async userId => {
            try {
              const user = await chatService.getUser(userId);
              if (user) {
                setUsers(prev => ({...prev, [userId]: user}));
              }
            } catch (error) {
              console.error('Error fetching user:', userId, error);
            }
          });

          await Promise.all(userPromises);
          console.log('All users fetched successfully');
          setLoading(false);
        } catch (error) {
          console.error('Error in conversation subscription callback:', error);
          setLoading(false);
        }
      },
    );

    return () => {
      console.log('Cleaning up conversation subscription');
      unsubscribeConversations();
    };
  }, [currentUser]);

  const getOtherUser = (conversation: Conversation) => {
    const otherUserId = conversation.participants.find(
      id => id !== currentUser?.uid,
    );
    return otherUserId ? users[otherUserId] : null;
  };

  const handleConversationPress = (conversation: Conversation) => {
    const otherUser = getOtherUser(conversation);
    if (!otherUser) {
      return;
    }

    navigation.navigate('ChatRoom', {
      conversationId: conversation.id,
      otherUserId: otherUser.id,
      otherUserName: otherUser.displayName,
    });
  };

  const renderConversation = ({item}: {item: Conversation}) => {
    const otherUser = getOtherUser(item);
    if (!otherUser) {
      return null;
    }

    const lastMessageTime = item.lastMessage?.timestamp
      ? formatConversationTime(item.lastMessage.timestamp)
      : '';

    return (
      <TouchableOpacity
        style={styles.conversationItem}
        onPress={() => handleConversationPress(item)}
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
                item.unreadCount > 0 && styles.unreadMessage,
              ]}
              numberOfLines={1}
              ellipsizeMode="tail">
              {item.lastMessage?.text || 'No messages yet'}
            </Text>
            {item.unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadCount}>
                  {item.unreadCount > 99 ? '99+' : item.unreadCount}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
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
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Messages</Text>
          <TouchableOpacity
            style={styles.newChatButton}
            onPress={() => navigation.navigate('UserDiscovery')}
            activeOpacity={0.7}>
            <Image
              source={icons.user}
              style={styles.newChatIcon}
              tintColor={colors.white}
            />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={conversations}
        renderItem={renderConversation}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
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
              onPress={() => navigation.navigate('UserDiscovery')}
              activeOpacity={0.7}>
              <Text style={styles.startChatButtonText}>Start a Chat</Text>
            </TouchableOpacity>
          </View>
        }
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

export default ChatList;
