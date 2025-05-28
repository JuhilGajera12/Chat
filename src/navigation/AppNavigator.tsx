import React, {useCallback, useEffect, useMemo} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {Platform, ActivityIndicator, View, StyleSheet} from 'react-native';
import {RootStackParamList, linking} from './types';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import ChatRoom from '../screens/ChatRoom';
import UserDiscoveryScreen from '../screens/UserDiscoveryScreen';
import PostDetails from '../screens/PostDetails';
import TaskDetails from '../screens/TaskDetails';
import {colors} from '../constant/colors';
import {fonts} from '../constant/fonts';
import {fontSize, navigationRef} from '../helpers/globalFunction';
import {useSession, useAppDispatch, useAppSelector} from '../hooks/useRedux';
import auth from '@react-native-firebase/auth';
import {setUser} from '../store/slices/authSlice';
import {initializeNavigation} from '../store/slices/navigationSlice';
import BottomTabNavigator from './BottomTabNavigator';

const Stack = createNativeStackNavigator<RootStackParamList>();

const LoadingScreen = React.memo(() => (
  <View style={styles.loaderStyle}>
    <ActivityIndicator size="large" color={colors.primaryColor} />
  </View>
));

const useScreenOptions = () =>
  useMemo(
    () => ({
      headerStyle: {backgroundColor: colors.white},
      headerTintColor: colors.black,
      headerTitleStyle: {
        fontFamily: fonts.bold,
        fontSize: fontSize(18),
      },
      headerShadowVisible: false,
      ...(Platform.OS === 'ios' && {headerBackTitle: ''}),
    }),
    [],
  );

const NavigationContainerWrapper = React.memo(
  ({children}: {children: React.ReactNode}) => {
    return (
      <NavigationContainer linking={linking} ref={navigationRef}>
        {children}
      </NavigationContainer>
    );
  },
);

const StackScreens = React.memo(
  ({initialRoute}: {initialRoute: keyof RootStackParamList}) => {
    const screenOptions = useScreenOptions();

    return (
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={screenOptions}>
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Signup"
          component={SignupScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="MainTabs"
          component={BottomTabNavigator}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="ChatRoom"
          component={ChatRoom}
          options={({route}) => ({
            title: route.params.otherUserName,
          })}
        />
        <Stack.Screen
          name="UserDiscovery"
          component={UserDiscoveryScreen}
          options={{
            title: 'Find Users',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="PostDetails"
          component={PostDetails}
          options={{
            title: 'Post Details',
          }}
        />
        <Stack.Screen
          name="TaskDetails"
          component={TaskDetails}
          options={{
            title: 'Task Details',
          }}
        />
      </Stack.Navigator>
    );
  },
);

const useAuthStateChange = () => {
  const dispatch = useAppDispatch();
  const {getUserSession} = useSession();

  return useCallback(
    async (user: any) => {
      dispatch(setUser(user));
      if (user) {
        try {
          await getUserSession();
        } catch (error) {
          console.error('Error getting user session:', error);
        }
      }
      dispatch(initializeNavigation());
    },
    [dispatch, getUserSession],
  );
};

const useNavigationState = () => {
  return useAppSelector(
    state => ({
      initialRoute: (state.navigation.initializing ? 'Login' : state.auth.user ? 'MainTabs' : 'Login') as keyof RootStackParamList,
      initializing: state.navigation.initializing,
    }),
    (prev, next) =>
      prev.initialRoute === next.initialRoute &&
      prev.initializing === next.initializing,
  );
};

const AppNavigator = () => {
  const {initialRoute, initializing} = useNavigationState();
  const handleAuthStateChange = useAuthStateChange();
  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(handleAuthStateChange);
    return () => {
      unsubscribe();
    };
  }, [handleAuthStateChange]);

  const navigationContent = useMemo(() => {
    if (initializing) {
      return <LoadingScreen />;
    }

    return (
      <NavigationContainerWrapper>
        <StackScreens initialRoute={initialRoute} />
      </NavigationContainerWrapper>
    );
  }, [initializing, initialRoute]);

  return navigationContent;
};

const styles = StyleSheet.create({
  loaderStyle: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

AppNavigator.displayName = 'AppNavigator';
LoadingScreen.displayName = 'LoadingScreen';
StackScreens.displayName = 'StackScreens';
NavigationContainerWrapper.displayName = 'NavigationContainerWrapper';

export default React.memo(AppNavigator);
