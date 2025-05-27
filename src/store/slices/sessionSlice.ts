import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';
import {commonAction} from '../../helpers/globalFunction';

const SESSION_KEY = '@user_session';

export interface UserSession {
  user: {
    uid: string;
    email: string | null;
    displayName: string | null;
  };
  timestamp: number;
}

interface SessionState {
  session: UserSession | null;
  loading: boolean;
  error: {code: string; message: string} | null;
}

const initialState: SessionState = {
  session: null,
  loading: false,
  error: null,
};

export const saveUserSession = createAsyncThunk(
  'session/saveUserSession',
  async (user: any) => {
    try {
      const session: UserSession = {
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
        },
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
      return {session, error: null};
    } catch (error) {
      throw {
        code: 'session/save-failed',
        message: 'Failed to save user session',
      };
    }
  },
);

export const getUserSession = createAsyncThunk(
  'session/getUserSession',
  async () => {
    try {
      const sessionString = await AsyncStorage.getItem(SESSION_KEY);
      if (!sessionString) {
        return {session: null, error: null};
      }
      const session: UserSession = JSON.parse(sessionString);
      return {session, error: null};
    } catch (error) {
      throw {
        code: 'session/read-failed',
        message: 'Failed to read user session',
      };
    }
  },
);

export const clearUserSession = createAsyncThunk(
  'session/clearUserSession',
  async () => {
    try {
      await AsyncStorage.removeItem(SESSION_KEY);
      return {error: null};
    } catch (error) {
      throw {
        code: 'session/clear-failed',
        message: 'Failed to clear user session',
      };
    }
  },
);

export const handleLogout = createAsyncThunk(
  'session/handleLogout',
  async () => {
    try {
      await auth().signOut();
      await AsyncStorage.removeItem(SESSION_KEY);
      commonAction('Login');
      return {error: null};
    } catch (error: any) {
      throw {
        code: error.code,
        message: 'Failed to logout',
      };
    }
  },
);

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    clearError: state => {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      // Save User Session
      .addCase(saveUserSession.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveUserSession.fulfilled, (state, action) => {
        state.loading = false;
        state.session = action.payload.session;
      })
      .addCase(saveUserSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as {code: string; message: string};
      })
      // Get User Session
      .addCase(getUserSession.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserSession.fulfilled, (state, action) => {
        state.loading = false;
        state.session = action.payload.session;
      })
      .addCase(getUserSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as {code: string; message: string};
      })
      // Clear User Session
      .addCase(clearUserSession.fulfilled, state => {
        state.session = null;
        state.error = null;
      })
      .addCase(clearUserSession.rejected, (state, action) => {
        state.error = action.payload as {code: string; message: string};
      })
      // Handle Logout
      .addCase(handleLogout.fulfilled, state => {
        state.session = null;
        state.error = null;
      })
      .addCase(handleLogout.rejected, (state, action) => {
        state.error = action.payload as {code: string; message: string};
      });
  },
});

export const {clearError} = sessionSlice.actions;
export default sessionSlice.reducer;
