import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {Platform} from 'react-native';
import {RootStackParamList} from './types';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import ChatList from '../screens/ChatList';
import ChatRoom from '../screens/ChatRoom';
import UserDiscoveryScreen from '../screens/UserDiscoveryScreen';
import {colors} from '../constant/colors';
import {fonts} from '../constant/fonts';
import {fontSize, navigationRef} from '../helpers/globalFunction';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        initialRouteName="Login"
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
