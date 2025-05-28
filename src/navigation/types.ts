import {NavigatorScreenParams} from '@react-navigation/native';
import {MaterialTopTabScreenProps} from '@react-navigation/material-top-tabs';
import {LinkingOptions} from '@react-navigation/native';

export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  ChatRoom: {
    otherUserId: string;
    otherUserName: string;
  };
  UserDiscovery: undefined;
  PostDetails: {
    postId: string;
  };
  TaskDetails: {
    taskId: string;
  };
};

export type MainTabParamList = {
  Chats: undefined;
  Collection: {
    screen?: 'Tasks' | 'Posts';
    params?: {
      postId?: string;
      taskId?: string;
    };
  };
};

export type CollectionTabParamList = {
  Tasks: undefined;
  Posts: undefined;
};

export type CollectionScreenProps =
  MaterialTopTabScreenProps<CollectionTabParamList>;

// Deep linking configuration
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
