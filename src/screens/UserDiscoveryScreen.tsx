import React, {useState, useEffect} from 'react';
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
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/types';
import auth from '@react-native-firebase/auth';
import {fonts} from '../constant/fonts';
import {colors} from '../constant/colors';
import {fontSize, hp, wp} from '../helpers/globalFunction';
import {chatService} from '../services/chat';
import {ChatUser} from '../types/chat';
import {icons} from '../constant/icons';

type Props = NativeStackScreenProps<RootStackParamList, 'UserDiscovery'>;

const UserDiscoveryScreen = ({navigation}: Props) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const searchUsers = async () => {
      if (searchQuery.length < 2) {
        setUsers([]);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const results = await chatService.searchUsers(searchQuery);
        setUsers(results);
      } catch (err) {
        setError('Failed to search users');
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchUsers, 500);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleStartChat = async (user: ChatUser) => {
    try {
      // Get current user ID from auth
      const currentUser = auth().currentUser;
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      // Check if conversation already exists
      const existingConversation = await chatService.findConversation(
        currentUser.uid,
        user.id,
      );

      if (existingConversation) {
        // Navigate to existing conversation
        navigation.navigate('ChatRoom', {
          conversationId: existingConversation.id,
          otherUserId: user.id,
          otherUserName: user.displayName,
        });
      } else {
        // Create new conversation
        const conversationId = await chatService.createConversation([
          currentUser.uid,
          user.id,
        ]);

        // Navigate to new conversation
        navigation.navigate('ChatRoom', {
          conversationId,
          otherUserId: user.id,
          otherUserName: user.displayName,
        });
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to start chat');
      console.error('Start chat error:', err);
    }
  };

  const renderUserItem = ({item}: {item: ChatUser}) => (
    <TouchableOpacity
      style={styles.userItem}
      onPress={() => handleStartChat(item)}
      activeOpacity={0.7}>
      <View style={styles.userInfo}>
        <View style={styles.avatarContainer}>
          {item.photoURL ? (
            <Image source={{uri: item.photoURL}} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarText}>
                {item.displayName.charAt(0).toUpperCase()}
              </Text>
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
          <Text style={styles.userName} numberOfLines={1}>
            {item.displayName}
          </Text>
          <Text style={styles.userEmail} numberOfLines={1}>
            {item.email}
          </Text>
        </View>
      </View>
      <View style={styles.chatButton}>
        <Image
          source={icons.send}
          style={styles.chatIcon}
          tintColor={colors.primaryColor}
        />
      </View>
    </TouchableOpacity>
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
          data={users}
          renderItem={renderUserItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              {searchQuery.length >= 2 ? (
                <>
                  <Image
                    source={icons.emptyChat}
                    style={styles.emptyIcon}
                    resizeMode="contain"
                  />
                  <Text style={styles.emptyText}>No users found</Text>
                  <Text style={styles.emptySubText}>
                    Try searching with a different name
                  </Text>
                </>
              ) : (
                <>
                  <Image
                    source={icons.user}
                    style={styles.emptyIcon}
                    resizeMode="contain"
                  />
                  <Text style={styles.emptyText}>
                    Start typing to search for users
                  </Text>
                  <Text style={styles.emptySubText}>
                    Enter at least 2 characters to begin searching
                  </Text>
                </>
              )}
            </View>
          }
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
  chatButton: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    backgroundColor: colors.inputBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: wp(2),
  },
  chatIcon: {
    width: wp(5),
    height: wp(5),
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
    paddingHorizontal: wp(4),
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

export default UserDiscoveryScreen;
