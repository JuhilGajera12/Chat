import {createRef} from 'react';
import {
  widthPercentageToDP,
  heightPercentageToDP,
} from 'react-native-responsive-screen';
import {RFValue} from 'react-native-responsive-fontsize';
import {CommonActions} from '@react-navigation/native';

export const hp = val => heightPercentageToDP(val);
export const wp = val => widthPercentageToDP(val);
export const fontSize = val => RFValue(val, 812);

export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
export const navigationRef = createRef();

export function navigate(name, params) {
  navigationRef.current?.navigate(name, params);
}

export const goBack = () => navigationRef.current?.goBack();

export const commonAction = (name, params) => {
  navigationRef.current?.dispatch(
    CommonActions.reset({
      index: 0,
      routes: [{name: name, params: params}],
    }),
  );
};
