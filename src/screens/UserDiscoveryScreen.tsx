import React, {useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
  Platform,
  StatusBar,
  Keyboard,
} from 'react-native';
import {fonts} from '../constant/fonts';
import {colors} from '../constant/colors';
import {fontSize, hp, navigate, wp} from '../helpers/globalFunction';
import {ChatUser, Conversation} from '../types/chat';
import {icons} from '../constant/icons';
import {useChat, useAuth, useUI} from '../hooks';

const UserDiscoveryScreen = () => {
  const {
    userDiscovery: {searchQuery},
    setSearchQuery,
  } = useUI();

  const {
    searchUsers,
    findConversation,
    createConversation,
    searchResults,
    loading,
    error,
  } = useChat();
  const {user: currentUser} = useAuth();

  useEffect(() => {
    if (searchQuery.trim()) {
      searchUsers(searchQuery.trim());
    } else {
      searchUsers('');
    }
  }, [searchQuery, searchUsers]);

  const handleStartChat = async (user: ChatUser) => {
    try {
      if (!currentUser) throw new Error('User not authenticated');

      const result = await findConversation(currentUser.uid, user.id);
      const existingConversation = result.payload as Conversation | null;

      if (existingConversation) {
        navigate('ChatRoom', {
          conversationId: existingConversation.id,
          otherUserId: user.id,
          otherUserName: user.displayName,
        });
        return;
      }

      const newResult = await createConversation([currentUser.uid, user.id]);
      const newConversation = newResult.payload as Conversation;

      if (newConversation) {
        navigate('ChatRoom', {
          conversationId: newConversation.id,
          otherUserId: user.id,
          otherUserName: user.displayName,
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to start chat');
    }
  };

  const renderUserItem = ({item}: {item: ChatUser}) => {
    const initials = item.displayName
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase();

    return (
      <TouchableOpacity
        style={styles.userItem}
        onPress={() => handleStartChat(item)}
        activeOpacity={0.7}>
        <View style={styles.userInfo}>
          <View style={styles.avatarContainer}>
            {item.photoURL ? (
              <Image
                source={{uri: item.photoURL}}
                style={styles.avatar}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
            )}
            <View
              style={[
                styles.statusIndicator,
                {
                  backgroundColor:
                    item.status === 'online'
                      ? colors.success
                      : colors.placeHolder,
                },
              ]}
            />
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{item.displayName}</Text>
            <Text style={styles.userEmail}>{item.email}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const listEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>
        {searchQuery.trim()
          ? 'No users found'
          : 'Search for users to start chatting'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={colors.white}
        translucent
      />
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Image
            source={icons.user}
            style={styles.searchIcon}
            tintColor={colors.placeHolder}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={colors.placeHolder}
            returnKeyType="search"
            onSubmitEditing={Keyboard.dismiss}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => setSearchQuery('')}
              activeOpacity={0.7}>
              <Text style={styles.clearButtonText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primaryColor} />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => setSearchQuery('')}
            activeOpacity={0.7}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={searchResults}
          renderItem={renderUserItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          initialNumToRender={10}
          ListEmptyComponent={listEmptyComponent}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: wp(4),
    marginVertical: hp(2),
    backgroundColor: colors.inputBackground,
    borderRadius: hp(2),
    paddingHorizontal: wp(3),
  },
  searchIcon: {
    width: wp(5),
    height: wp(5),
    marginRight: wp(2),
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: fontSize(16),
    color: colors.black,
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(2),
  },
  clearButton: {
    padding: wp(2),
  },
  clearButtonText: {
    fontFamily: fonts.regular,
    fontSize: fontSize(14),
    color: colors.placeHolder,
  },
  listContainer: {
    flexGrow: 1,
    paddingBottom: hp(2),
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
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
  userEmail: {
    fontFamily: fonts.regular,
    fontSize: fontSize(14),
    color: colors.placeHolder,
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
    marginBottom: hp(2),
  },
  retryButton: {
    backgroundColor: colors.primaryColor,
    paddingHorizontal: wp(6),
    paddingVertical: hp(1.5),
    borderRadius: hp(1),
  },
  retryButtonText: {
    fontFamily: fonts.bold,
    fontSize: fontSize(14),
    color: colors.white,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp(6),
    paddingTop: hp(20),
  },
  emptyText: {
    fontFamily: fonts.regular,
    fontSize: fontSize(16),
    color: colors.placeHolder,
    textAlign: 'center',
  },
});

export default React.memo(UserDiscoveryScreen);
