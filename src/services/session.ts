import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';
import { ChatUser } from '../types/chat';

const SESSION_KEY = '@user_session';

export interface UserSession {
  user: {
    uid: string;
    email: string | null;
    displayName: string | null;
  };
  timestamp: number;
}

export const saveUserSession = async (user: any) => {
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
    return { error: null };
  } catch (error) {
    return {
      error: {
        code: 'session/save-failed',
        message: 'Failed to save user session',
      },
    };
  }
};

export const getUserSession = async () => {
  try {
    const sessionString = await AsyncStorage.getItem(SESSION_KEY);
    if (!sessionString) {
      return { session: null, error: null };
    }
    const session: UserSession = JSON.parse(sessionString);
    return { session, error: null };
  } catch (error) {
    return {
      session: null,
      error: {
        code: 'session/read-failed',
        message: 'Failed to read user session',
      },
    };
  }
};

export const clearUserSession = async () => {
  try {
    await AsyncStorage.removeItem(SESSION_KEY);
    return { error: null };
  } catch (error) {
    return {
      error: {
        code: 'session/clear-failed',
        message: 'Failed to clear user session',
      },
    };
  }
};

export const handleLogout = async () => {
  try {
    await auth().signOut();
    await clearUserSession();
    return { error: null };
  } catch (error: any) {
    return {
      error: {
        code: error.code,
        message: 'Failed to logout',
      },
    };
  }
}; 