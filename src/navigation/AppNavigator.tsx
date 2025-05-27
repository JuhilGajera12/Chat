import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {Platform, ActivityIndicator, View} from 'react-native';
import {RootStackParamList} from './types';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import ChatList from '../screens/ChatList';
import ChatRoom from '../screens/ChatRoom';
import UserDiscoveryScreen from '../screens/UserDiscoveryScreen';
import {colors} from '../constant/colors';
import {fonts} from '../constant/fonts';
import {fontSize, navigationRef} from '../helpers/globalFunction';
import {getUserSession} from '../services/session';
import auth from '@react-native-firebase/auth';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  const [initializing, setInitializing] = useState(true);
  const [initialRoute, setInitialRoute] = useState<'Login' | 'ChatList'>('Login');

  useEffect(() => {
    const checkSession = async () => {
      try {
        // Check AsyncStorage session
        const {session} = await getUserSession();
        
        // Check Firebase auth state
        const unsubscribe = auth().onAuthStateChanged(user => {
          if (user && session) {
            setInitialRoute('ChatList');
          } else {
            setInitialRoute('Login');
          }
          setInitializing(false);
        });

        return unsubscribe;
      } catch (error) {
        console.error('Session check error:', error);
        setInitialRoute('Login');
        setInitializing(false);
      }
    };

    checkSession();
  }, []);

  if (initializing) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" color={colors.primaryColor} />
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.white,
          },
          headerTintColor: colors.black,
          headerTitleStyle: {
            fontFamily: fonts.bold,
            fontSize: fontSize(18),
          },
          headerShadowVisible: false,
          ...(Platform.OS === 'ios' && {headerBackTitle: ''}), // iOS-specific
        }}>
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
          name="ChatList"
          component={ChatList}
          options={{
            title: 'Messages',
            headerShown: false,
          }}
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
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
