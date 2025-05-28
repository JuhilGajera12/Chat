import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';
import {commonAction} from '../../helpers/globalFunction';
import {serializeDate, deserializeDate} from '../../utils/serialization';

const SESSION_KEY = '@user_session';

export interface UserSession {
  user: {
    uid: string;
    email: string | null;
    displayName: string | null;
  };
  timestamp: string; // ISO string for serialization
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
        timestamp: serializeDate(new Date()) || new Date().toISOString(),
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

export const getUserSession = createAsyncThunk('session/getUserSession', async () => {
  try {
    const sessionStr = await AsyncStorage.getItem(SESSION_KEY);
    if (!sessionStr) {
      return {session: null, error: null};
    }
    const session = JSON.parse(sessionStr) as UserSession;
    return {session, error: null};
  } catch (error) {
    throw {
      code: 'session/get-failed',
      message: 'Failed to get user session',
    };
  }
});

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

export const handleLogout = createAsyncThunk('session/handleLogout', async () => {
  try {
    await auth().signOut();
    await AsyncStorage.removeItem(SESSION_KEY);
    return {error: null};
  } catch (error: any) {
    throw {
      code: error.code || 'session/logout-failed',
      message: 'Failed to logout',
    };
  }
});

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
      .addCase(clearUserSession.fulfilled, state => {
        state.session = null;
        state.error = null;
      })
      .addCase(clearUserSession.rejected, (state, action) => {
        state.error = action.payload as {code: string; message: string};
      })
      .addCase(handleLogout.fulfilled, state => {
        state.session = null;
        state.error = null;
      })
      .addCase(handleLogout.rejected, (state, action) => {
        state.error = action.payload as {code: string; message: string};
      });
  },
});

// Selectors
export const selectSession = (state: {session: SessionState}) => ({
  ...state.session.session,
  timestamp: state.session.session?.timestamp ? deserializeDate(state.session.session.timestamp) : undefined,
});

export const {clearError} = sessionSlice.actions;
export default sessionSlice.reducer;
