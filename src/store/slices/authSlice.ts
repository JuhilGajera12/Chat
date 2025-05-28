import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {ChatUser} from '../../types/chat';
import {
  serializeUser,
  dateToFirestoreTimestamp,
} from '../../utils/serialization';

interface AuthState {
  user: {
    uid: string;
    email: string | null;
    displayName: string | null;
    createdAt?: string;
    lastLoginAt?: string;
  } | null;
  loading: boolean;
  error: {code: string; message: string} | null;
}

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
};

const serializeFirebaseUser = (user: any) => ({
  uid: user.uid,
  email: user.email,
  displayName: user.displayName,
  createdAt: user.metadata?.creationTime
    ? new Date(user.metadata.creationTime).toISOString()
    : undefined,
  lastLoginAt: user.metadata?.lastSignInTime
    ? new Date(user.metadata.lastSignInTime).toISOString()
    : undefined,
});

export const signInWithEmail = createAsyncThunk(
  'auth/signInWithEmail',
  async ({email, password}: {email: string; password: string}) => {
    try {
      const userCredential = await auth().signInWithEmailAndPassword(
        email,
        password,
      );
      return {user: serializeFirebaseUser(userCredential.user), error: null};
    } catch (error: any) {
      console.log('🚀 ~ error:', error);
      let errorMessage = 'An error occurred during sign in';
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Invalid password';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      }
      throw {code: error.code, message: errorMessage};
    }
  },
);

export const signUpWithEmail = createAsyncThunk(
  'auth/signUpWithEmail',
  async ({email, password}: {email: string; password: string}) => {
    try {
      const userCredential = await auth().createUserWithEmailAndPassword(
        email,
        password,
      );
      return {user: serializeFirebaseUser(userCredential.user), error: null};
    } catch (error: any) {
      let errorMessage = 'An error occurred during sign up';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'An account already exists with this email';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters';
      }
      throw {code: error.code, message: errorMessage};
    }
  },
);

export const signOut = createAsyncThunk('auth/signOut', async () => {
  try {
    await auth().signOut();
    return {error: null};
  } catch (error: any) {
    throw {code: error.code, message: 'An error occurred during sign out'};
  }
});

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async (email: string) => {
    try {
      await auth().sendPasswordResetEmail(email);
      return {error: null};
    } catch (error: any) {
      let errorMessage = 'An error occurred while resetting password';
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email';
      }
      throw {code: error.code, message: errorMessage};
    }
  },
);

export const createUserProfile = createAsyncThunk(
  'auth/createUserProfile',
  async ({user, name}: {user: any; name: string}) => {
    try {
      const now = new Date();
      const userProfile: ChatUser = {
        id: user.uid,
        displayName: name,
        email: user.email,
        status: 'offline',
        lastSeen: now,
      };

      const serializedProfile = serializeUser(userProfile);
      await firestore()
        .collection('users')
        .doc(user.uid)
        .set({
          ...serializedProfile,
          lastSeen: dateToFirestoreTimestamp(now),
        });
      return {error: null};
    } catch (error: any) {
      throw {
        code: error.code,
        message: 'Failed to create user profile',
      };
    }
  },
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: state => {
      state.error = null;
    },
    setUser: (state, action) => {
      state.user = action.payload
        ? serializeFirebaseUser(action.payload)
        : null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(signInWithEmail.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signInWithEmail.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
      })
      .addCase(signInWithEmail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as {code: string; message: string};
      })
      .addCase(signUpWithEmail.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signUpWithEmail.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
      })
      .addCase(signUpWithEmail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as {code: string; message: string};
      })
      .addCase(signOut.fulfilled, state => {
        state.user = null;
        state.error = null;
      })
      .addCase(signOut.rejected, (state, action) => {
        state.error = action.payload as {code: string; message: string};
      })
      .addCase(resetPassword.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, state => {
        state.loading = false;
      })
      .addCase(resetPassword.rejected, state => {
        state.loading = false;
      })
      .addCase(createUserProfile.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createUserProfile.fulfilled, state => {
        state.loading = false;
      })
      .addCase(createUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as {code: string; message: string};
      });
  },
});

export const {clearError, setUser} = authSlice.actions;
export default authSlice.reducer;
