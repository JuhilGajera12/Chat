import {NavigatorScreenParams} from '@react-navigation/native';
import {MaterialTopTabScreenProps} from '@react-navigation/material-top-tabs';
import {LinkingOptions} from '@react-navigation/native';

type EmptyParams = Record<string, never>;

type LoginScreenParams = EmptyParams;
type SignupScreenParams = EmptyParams;
type UserDiscoveryScreenParams = EmptyParams;
type ChatListScreenParams = EmptyParams;

type ChatRoomScreenParams = {
  otherUserId: string;
  otherUserName: string;
  conversationId: string;
};

type PostDetailsScreenParams = {
  postId: string;
};

type TaskDetailsScreenParams = {
  taskId: string;
};

type MainTabsScreenParams = NavigatorScreenParams<MainTabParamList>;

export type RootStackParamList = {
  Login: LoginScreenParams;
  Signup: SignupScreenParams;
  MainTabs: MainTabsScreenParams;
  ChatRoom: ChatRoomScreenParams;
  UserDiscovery: UserDiscoveryScreenParams;
  PostDetails: PostDetailsScreenParams;
  TaskDetails: TaskDetailsScreenParams;
  ChatList: ChatListScreenParams;
};

export type MainTabParamList = {
  Chats: EmptyParams;
  Collection: {
    screen?: 'Tasks' | 'Posts';
    params?: {
      postId?: string;
      taskId?: string;
    };
  };
};

export type CollectionTabParamList = {
  Tasks: EmptyParams;
  Posts: EmptyParams;
};

export type CollectionScreenProps =
  MaterialTopTabScreenProps<CollectionTabParamList>;

export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['example://', 'https://example.com'],
  config: {
    screens: {
      MainTabs: {
        screens: {
          Collection: {
            path: 'collection/:screen?/:taskId?/:postId?',
            parse: {
              screen: (screen: string) =>
                screen === 'Posts' ? 'Posts' : 'Tasks',
              taskId: (taskId: string) => taskId,
              postId: (postId: string) => postId,
            },
          },
        },
      },
      PostDetails: {
        path: 'post/:postId',
        parse: {
          postId: (postId: string) => postId,
        },
      },
      TaskDetails: {
        path: 'task/:taskId',
        parse: {
          taskId: (taskId: string) => taskId,
        },
      },
    },
  },
};
