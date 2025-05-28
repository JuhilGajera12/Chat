import {createSlice, PayloadAction} from '@reduxjs/toolkit';

export type CollectionTab = 'Tasks' | 'Posts';

interface CollectionState {
  activeTab: number;
  selectedScreen: CollectionTab | null;
  deepLinkParams: {
    postId?: string;
    taskId?: string;
  } | null;
}

const initialState: CollectionState = {
  activeTab: 0,
  selectedScreen: null,
  deepLinkParams: null,
};

const collectionSlice = createSlice({
  name: 'collection',
  initialState,
  reducers: {
    setActiveTab: (state, action: PayloadAction<number>) => {
      state.activeTab = action.payload;
    },
    setSelectedScreen: (state, action: PayloadAction<CollectionTab>) => {
      state.selectedScreen = action.payload;
      state.activeTab = action.payload === 'Posts' ? 1 : 0;
    },
    setDeepLinkParams: (
      state,
      action: PayloadAction<{
        postId?: string;
        taskId?: string;
      } | null>,
    ) => {
      state.deepLinkParams = action.payload;
    },
    clearDeepLinkParams: state => {
      state.deepLinkParams = null;
    },
  },
});

export const {
  setActiveTab,
  setSelectedScreen,
  setDeepLinkParams,
  clearDeepLinkParams,
} = collectionSlice.actions;

export default collectionSlice.reducer; 