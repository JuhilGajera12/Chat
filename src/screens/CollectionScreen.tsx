import React, {useCallback, useRef, useEffect} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Animated,
  StatusBar,
  Dimensions,
  Text,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useRoute, useNavigation} from '@react-navigation/native';
import {colors} from '../constant/colors';
import {fonts} from '../constant/fonts';
import {fontSize, hp, wp} from '../helpers/globalFunction';
import {useAppDispatch, useAppSelector} from '../hooks/useRedux';
import {
  setActiveTab,
  setSelectedScreen,
  setDeepLinkParams,
  clearDeepLinkParams,
} from '../store/slices/collectionSlice';
import {fetchPosts, clearPosts} from '../store/slices/postSlice';
import {fetchTasks, clearTasks} from '../store/slices/taskSlice';
import {MainTabParamList, RootStackParamList} from '../navigation/types';
import type {RouteProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import auth from '@react-native-firebase/auth';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

type CollectionScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const TasksScreen = () => {
  const navigation = useNavigation<CollectionScreenNavigationProp>();
  const route = useRoute<RouteProp<MainTabParamList, 'Collection'>>();
  const dispatch = useAppDispatch();
  const {tasks, loading, error} = useAppSelector(state => state.tasks);
  const {deepLinkParams} = useAppSelector(state => state.collection);

  // Handle deep linking for tasks
  useEffect(() => {
    const taskId = deepLinkParams?.taskId || route.params?.params?.taskId;
    if (taskId) {
      console.log('Deep link taskId received:', taskId);
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        console.log('Navigating to task details:', task);
        navigation.navigate('TaskDetails', {taskId});
        dispatch(clearDeepLinkParams());
      } else {
        console.log('Task not found for ID:', taskId);
      }
    }
  }, [deepLinkParams?.taskId, route.params?.params?.taskId, tasks, navigation, dispatch]);

  useEffect(() => {
    const fetchData = async () => {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        console.error('No authenticated user found');
        return;
      }
      dispatch(fetchTasks());
    };

    fetchData();
    return () => {
      dispatch(clearTasks());
    };
  }, [dispatch]);

  const handleTaskPress = (taskId: string) => {
    navigation.navigate('TaskDetails', {taskId});
  };

  const renderTaskItem = ({item}: {item: typeof tasks[0]}) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => handleTaskPress(item.id)}>
      <Text style={styles.itemTitle}>{item.task}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.content, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.primaryColor} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.content, styles.centerContent]}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.content}>
      <FlatList
        data={tasks}
        renderItem={renderTaskItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No tasks found</Text>
          </View>
        }
      />
    </View>
  );
};

const PostsScreen = () => {
  const navigation = useNavigation<CollectionScreenNavigationProp>();
  const route = useRoute<RouteProp<MainTabParamList, 'Collection'>>();
  const dispatch = useAppDispatch();
  const {posts, loading, error} = useAppSelector(state => state.posts);
  const {deepLinkParams} = useAppSelector(state => state.collection);

  // Handle deep linking for posts
  useEffect(() => {
    const postId = deepLinkParams?.postId || route.params?.params?.postId;
    if (postId) {
      console.log('Deep link postId received:', postId);
      const post = posts.find(p => p.id === postId);
      if (post) {
        console.log('Navigating to post details:', post);
        navigation.navigate('PostDetails', {postId});
        dispatch(clearDeepLinkParams());
      } else {
        console.log('Post not found for ID:', postId);
      }
    }
  }, [deepLinkParams?.postId, route.params?.params?.postId, posts, navigation, dispatch]);

  useEffect(() => {
    const fetchData = async () => {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        console.error('No authenticated user found');
        return;
      }
      dispatch(fetchPosts());
    };

    fetchData();
    return () => {
      dispatch(clearPosts());
    };
  }, [dispatch]);

  const handlePostPress = (postId: string) => {
    navigation.navigate('PostDetails', {postId});
  };

  const renderPostItem = ({item}: {item: typeof posts[0]}) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => handlePostPress(item.id)}>
      <Text style={styles.itemTitle}>{item.post}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.content, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.primaryColor} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.content, styles.centerContent]}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.content}>
      <FlatList
        data={posts}
        renderItem={renderPostItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No posts found</Text>
          </View>
        }
      />
    </View>
  );
};

const CustomTabBar = () => {
  const dispatch = useAppDispatch();
  const activeTab = useAppSelector(state => state.collection.activeTab);
  const scale = useRef(new Animated.Value(1)).current;

  const handlePress = useCallback(
    (index: number) => {
      dispatch(setActiveTab(index));
      dispatch(setSelectedScreen(index === 0 ? 'Tasks' : 'Posts'));
    },
    [dispatch],
  );

  const onPressIn = useCallback(() => {
    Animated.spring(scale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  }, [scale]);

  const onPressOut = useCallback(() => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }, [scale]);

  const indicatorPosition = useRef(
    new Animated.Value(activeTab * (SCREEN_WIDTH / 2)),
  ).current;

  useEffect(() => {
    Animated.spring(indicatorPosition, {
      toValue: activeTab * (SCREEN_WIDTH / 2),
      useNativeDriver: true,
    }).start();
  }, [activeTab, indicatorPosition]);

  const renderTab = (index: number, label: string) => {
    const isActive = activeTab === index;

    return (
      <TouchableOpacity
        key={label}
        activeOpacity={0.7}
        onPress={() => handlePress(index)}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={styles.tabButton}>
        <Animated.View
          style={[
            styles.tabContent,
            {
              transform: [{scale}],
            },
          ]}>
          <Animated.Text
            style={[
              styles.tabLabel,
              {
                color: isActive ? colors.primaryColor : colors.gray,
                transform: [
                  {
                    scale: isActive ? 1.1 : 1,
                  },
                ],
              },
            ]}>
            {label}
          </Animated.Text>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.tabBarContainer}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={colors.white}
        translucent
      />
      <View style={styles.tabBar}>
        {renderTab(0, 'Tasks')}
        {renderTab(1, 'Posts')}
        <Animated.View
          style={[
            styles.indicator,
            {
              transform: [{translateX: indicatorPosition}],
            },
          ]}
        />
      </View>
    </View>
  );
};

const CollectionScreen = () => {
  const dispatch = useAppDispatch();
  const activeTab = useAppSelector(state => state.collection.activeTab);
  const route = useRoute<RouteProp<MainTabParamList, 'Collection'>>();

  // Handle deep link navigation for tab selection
  useEffect(() => {
    console.log('Collection screen params:', route.params);
    if (route.params?.screen) {
      console.log('Deep link screen param received:', route.params.screen);
      dispatch(setSelectedScreen(route.params.screen));
      if (route.params.params) {
        dispatch(setDeepLinkParams(route.params.params));
      }
    }
  }, [route.params, dispatch]);

  const renderContent = () => {
    switch (activeTab) {
      case 0:
        return <TasksScreen />;
      case 1:
        return <PostsScreen />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <CustomTabBar />
      <Animated.View style={styles.contentContainer}>
        {renderContent()}
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  contentContainer: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBarContainer: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabBar: {
    flexDirection: 'row',
    height: hp(6),
    position: 'relative',
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContent: {
    paddingHorizontal: wp(4),
    paddingVertical: hp(1),
  },
  tabLabel: {
    fontSize: fontSize(16),
    fontFamily: fonts.regular,
  },
  indicator: {
    position: 'absolute',
    bottom: 0,
    width: SCREEN_WIDTH / 2,
    height: 2,
    backgroundColor: colors.primaryColor,
  },
  itemContainer: {
    padding: wp(4),
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  itemTitle: {
    fontSize: fontSize(16),
    fontFamily: fonts.regular,
    color: colors.black,
  },
  listContent: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: hp(4),
  },
  emptyText: {
    fontSize: fontSize(16),
    fontFamily: fonts.regular,
    color: colors.gray,
  },
  errorText: {
    fontSize: fontSize(16),
    fontFamily: fonts.regular,
    color: colors.error,
    textAlign: 'center',
  },
});

export default CollectionScreen;
