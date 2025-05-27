import {configureStore} from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import sessionReducer from './slices/sessionSlice';
import chatReducer from './slices/chatSlice';
import navigationReducer from './slices/navigationSlice';
import uiReducer from './slices/uiSlice';
import {RootState} from './types';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    session: sessionReducer,
    chat: chatReducer,
    navigation: navigationReducer,
    ui: uiReducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['auth/setUser'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['payload.user', 'payload.lastSeen'],
        // Ignore these paths in the state
        ignoredPaths: ['auth.user', 'ui.chatRoom.userStatus.lastSeen'],
      },
    }),
});

export type AppDispatch = typeof store.dispatch;
export type {RootState};
