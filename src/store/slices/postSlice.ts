import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import firestore from '@react-native-firebase/firestore';

export type Post = {
  id: string;
  creator: string;
  post: string;
};

interface PostState {
  posts: Post[];
  currentPost: Post | null;
  loading: boolean;
  error: string | null;
}

const initialState: PostState = {
  posts: [],
  currentPost: null,
  loading: false,
  error: null,
};

export const fetchPosts = createAsyncThunk(
  'posts/fetchPosts',
  async (_, {rejectWithValue}) => {
    try {
      const postsRef = firestore().collection('posts');
      const postsSnapshot = await postsRef.get();
      return postsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Post[];
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch posts');
    }
  },
);

export const fetchPostById = createAsyncThunk(
  'posts/fetchPostById',
  async (postId: string, {rejectWithValue}) => {
    try {
      const postDoc = await firestore().collection('posts').doc(postId).get();
      if (!postDoc.exists()) {
        return rejectWithValue('Post not found');
      }
      return {
        id: postDoc.id,
        ...postDoc.data(),
      } as Post;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch post');
    }
  },
);

const postSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    clearCurrentPost: state => {
      state.currentPost = null;
      state.error = null;
    },
    clearPosts: state => {
      state.posts = [];
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      // Fetch Posts
      .addCase(fetchPosts.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = action.payload;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Post by ID
      .addCase(fetchPostById.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPostById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPost = action.payload;
      })
      .addCase(fetchPostById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {clearCurrentPost, clearPosts} = postSlice.actions;
export default postSlice.reducer; 