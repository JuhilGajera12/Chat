import {configureStore} from '@reduxjs/toolkit';
import chatReducer from './slices/chatSlice';
import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    chat: chatReducer,
    auth: authReducer,
    ui: uiReducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: true,
      immutableCheck: true,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
