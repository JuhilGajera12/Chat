import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {RootStackParamList} from '../../navigation/types';

type InitialRoute = keyof RootStackParamList;

interface NavigationState {
  initialRoute: InitialRoute;
  initializing: boolean;
  error: {code: string; message: string} | null;
}

const initialState: NavigationState = {
  initialRoute: 'Login',
  initializing: true,
  error: null,
};

export const initializeNavigation = createAsyncThunk(
  'navigation/initialize',
  async (_, {dispatch, getState}) => {
    try {
      const state = getState() as any;
      const {session} = state.session;
      const {user} = state.auth;

      if (user && session) {
        return {initialRoute: 'ChatList' as InitialRoute};
      }
      return {initialRoute: 'Login' as InitialRoute};
    } catch (error: any) {
      throw {
        code: 'navigation/init-failed',
        message: 'Failed to initialize navigation',
      };
    }
  },
);

const navigationSlice = createSlice({
  name: 'navigation',
  initialState,
  reducers: {
    clearError: state => {
      state.error = null;
    },
    setInitializing: (state, action) => {
      state.initializing = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(initializeNavigation.pending, state => {
        state.initializing = true;
        state.error = null;
      })
      .addCase(initializeNavigation.fulfilled, (state, action) => {
        state.initializing = false;
        state.initialRoute = action.payload.initialRoute;
      })
      .addCase(initializeNavigation.rejected, (state, action) => {
        state.initializing = false;
        state.error = action.payload as {code: string; message: string};
      });
  },
});

export const {clearError, setInitializing} = navigationSlice.actions;
export default navigationSlice.reducer; 