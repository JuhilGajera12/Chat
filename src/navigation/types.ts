export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  Home: undefined;
  ChatList: undefined;
  ChatRoom: {
    conversationId: string;
    otherUserId: string;
    otherUserName: string;
  };
  UserDiscovery: undefined;
  // Add other screens as needed
};
