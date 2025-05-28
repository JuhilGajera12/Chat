import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Image, StyleSheet} from 'react-native';
import {colors} from '../constant/colors';
import ChatList from '../screens/ChatList';
import CollectionScreen from '../screens/CollectionScreen';
import {icons} from '../constant/icons';
import {fontSize, hp, wp} from '../helpers/globalFunction';
import {fonts} from '../constant/fonts';

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.primaryColor,
        tabBarInactiveTintColor: colors.gray,
        tabBarLabelStyle: styles.tabBarLabel,
        headerShown: false,
      }}>
      <Tab.Screen
        name="Chats"
        component={ChatList}
        options={{
          tabBarIcon: ({color}) => (
            <Image
              source={icons.chat}
              style={styles.iconStyle}
              resizeMode="contain"
              tintColor={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Collection"
        component={CollectionScreen}
        options={{
          tabBarIcon: ({color}) => (
            <Image
              source={icons.collection}
              style={styles.iconStyle}
              resizeMode="contain"
              tintColor={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.white,
    borderTopWidth: wp(0.49),
    borderTopColor: colors.placeHolder,
    height: hp(10),
  },
  tabBarLabel: {
    fontSize: fontSize(14),
    fontFamily: fonts.bold,
  },
  iconStyle: {
    height: wp(5.4),
    width: wp(5.4),
  },
});

export default BottomTabNavigator;
