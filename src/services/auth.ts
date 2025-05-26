import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {ChatUser} from '../types/chat';

export interface AuthError {
  code: string;
  message: string;
}

export const signInWithEmail = async (email: string, password: string) => {
  try {
    const userCredential = await auth().signInWithEmailAndPassword(
      email,
      password,
    );
    return {user: userCredential.user, error: null};
  } catch (error: any) {
    let errorMessage = 'An error occurred during sign in';
    if (error.code === 'auth/user-not-found') {
      errorMessage = 'No account found with this email';
    } else if (error.code === 'auth/wrong-password') {
      errorMessage = 'Invalid password';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email address';
    }
    return {user: null, error: {code: error.code, message: errorMessage}};
  }
};

export const signUpWithEmail = async (email: string, password: string) => {
  try {
    const userCredential = await auth().createUserWithEmailAndPassword(
      email,
      password,
    );
    return {user: userCredential.user, error: null};
  } catch (error: any) {
    let errorMessage = 'An error occurred during sign up';
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = 'An account already exists with this email';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email address';
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'Password should be at least 6 characters';
    }
    return {user: null, error: {code: error.code, message: errorMessage}};
  }
};

export const signOut = async () => {
  try {
    await auth().signOut();
    return {error: null};
  } catch (error: any) {
    return {
      error: {code: error.code, message: 'An error occurred during sign out'},
    };
  }
};

export const resetPassword = async (email: string) => {
  try {
    await auth().sendPasswordResetEmail(email);
    return {error: null};
  } catch (error: any) {
    let errorMessage = 'An error occurred while resetting password';
    if (error.code === 'auth/user-not-found') {
      errorMessage = 'No account found with this email';
    }
    return {error: {code: error.code, message: errorMessage}};
  }
};

export const createUserProfile = async (user: any, name: string) => {
  try {
    const userProfile: ChatUser = {
      id: user.uid,
      displayName: name,
      email: user.email,
      status: 'offline',
      lastSeen: Date.now(),
    };

    await firestore().collection('users').doc(user.uid).set(userProfile);
    return {error: null};
  } catch (error: any) {
    return {
      error: {
        code: error.code,
        message: 'Failed to create user profile',
      },
    };
  }
};
