import {useAppDispatch, useAppSelector} from './useRedux';
import {
  setSelectedMessage,
  setTypingUsers,
  setUserStatus,
  setSearchQuery,
  resetChatRoom,
  resetUserDiscovery,
} from '../store/slices/uiSlice';
import {ChatMessage} from '../types/chat';

export const useUI = () => {
  const dispatch = useAppDispatch();
  const ui = useAppSelector(
    state => state.ui,
    (prev, next) => prev === next,
  );

  const actions = {
    // Chat room actions
    setSelectedMessage: (message: ChatMessage | null) =>
      dispatch(setSelectedMessage(message)),
    setTypingUsers: (users: string[]) => dispatch(setTypingUsers(users)),
    setUserStatus: (status: {status: 'online' | 'offline'; lastSeen?: Date}) =>
      dispatch(setUserStatus(status)),
    resetChatRoom: () => dispatch(resetChatRoom()),

    // User discovery actions
    setSearchQuery: (query: string) => {
      dispatch(setSearchQuery(query));
    },
    resetUserDiscovery: () => dispatch(resetUserDiscovery()),
  };

  return {
    ...ui,
    ...actions,
  };
};
