import {configureStore} from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import sessionReducer from './slices/sessionSlice';
import chatReducer from './slices/chatSlice';
import navigationReducer from './slices/navigationSlice';
import uiReducer from './slices/uiSlice';
import collectionReducer from './slices/collectionSlice';
import postReducer from './slices/postSlice';
import taskReducer from './slices/taskSlice';
import {RootState} from './types';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    session: sessionReducer,
    chat: chatReducer,
    navigation: navigationReducer,
    ui: uiReducer,
    collection: collectionReducer,
    posts: postReducer,
    tasks: taskReducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['auth/setUser'],
        ignoredActionPaths: ['payload.user', 'payload.lastSeen'],
        ignoredPaths: ['auth.user', 'ui.chatRoom.userStatus.lastSeen'],
      },
    }),
});

export type AppDispatch = typeof store.dispatch;
export type {RootState};
