import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  StatusBar,
} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/types';
import {fonts} from '../constant/fonts';
import {fontSize, hp, wp} from '../helpers/globalFunction';
import {colors} from '../constant/colors';
import {icons} from '../constant/icons';

type Props = NativeStackScreenProps<RootStackParamList, 'Signup'>;

const SignupScreen = ({navigation}: Props) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const isFormValid =
    name &&
    email &&
    password &&
    confirmPassword &&
    password === confirmPassword;

  const handleSignup = () => {
    // TODO: Implement signup logic
    console.log('Signup pressed', {
      name,
      email,
      password,
      confirmPassword,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={colors.white}
        translucent
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}>
          <View style={styles.contentContainer}>
            <View style={styles.headerContainer}>
              <Text style={styles.welcomeText}>Create Account</Text>
              <Text style={styles.subtitleText}>
                Join us and start your journey today
              </Text>
            </View>

            <View style={styles.formContainer}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    name.length > 0 && styles.inputWrapperFocused,
                  ]}>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your full name"
                    value={name}
                    onChangeText={setName}
                    placeholderTextColor={colors.placeHolder}
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email Address</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    email.length > 0 && styles.inputWrapperFocused,
                  ]}>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholderTextColor={colors.placeHolder}
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Password</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    password.length > 0 && styles.inputWrapperFocused,
                  ]}>
                  <TextInput
                    style={styles.input}
                    placeholder="Create a password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    placeholderTextColor={colors.placeHolder}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeIcon}>
                    <Image
                      source={showPassword ? icons.eyeOpen : icons.eyeClosed}
                      style={styles.iconStyle}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Confirm Password</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    confirmPassword.length > 0 && styles.inputWrapperFocused,
                  ]}>
                  <TextInput
                    style={styles.input}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    placeholderTextColor={colors.placeHolder}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.eyeIcon}>
                    <Image
                      source={
                        showConfirmPassword ? icons.eyeOpen : icons.eyeClosed
                      }
                      style={styles.iconStyle}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                </View>
                {confirmPassword.length > 0 && password !== confirmPassword && (
                  <Text style={styles.errorText}>Passwords do not match</Text>
                )}
              </View>

              <TouchableOpacity
                style={[
                  styles.signupButton,
                  !isFormValid && styles.signupButtonDisabled,
                ]}
                onPress={handleSignup}
                disabled={!isFormValid}>
                <Text style={styles.signupButtonText}>Create Account</Text>
              </TouchableOpacity>

              <View style={styles.dividerContainer}>
                <View style={styles.divider} />
                <Text style={styles.dividerText}>or sign up with</Text>
                <View style={styles.divider} />
              </View>

              <View style={styles.socialButtonsContainer}>
                <TouchableOpacity
                  style={styles.socialButton}
                  onPress={() => {
                    /* TODO: Implement Google signup */
                  }}>
                  <Image
                    source={icons.google}
                    style={styles.socialIcon}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.footerContainer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Login')}
                style={styles.loginButton}>
                <Text style={styles.loginText}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  contentContainer: {
    flex: 1,
    paddingTop: hp(6),
    paddingBottom: hp(4),
  },
  headerContainer: {
    paddingHorizontal: wp(6),
    marginBottom: hp(8),
  },
  welcomeText: {
    fontFamily: fonts.bold,
    fontSize: fontSize(32),
    color: colors.primaryColor,
    marginBottom: hp(1),
    textAlign: 'center',
  },
  subtitleText: {
    fontFamily: fonts.regular,
    fontSize: fontSize(16),
    color: colors.black,
    lineHeight: fontSize(24),
    textAlign: 'center',
  },
  formContainer: {
    paddingHorizontal: wp(6),
  },
  inputContainer: {
    marginBottom: hp(4),
  },
  inputLabel: {
    fontFamily: fonts.bold,
    fontSize: fontSize(15),
    color: colors.black,
    marginBottom: hp(1),
    letterSpacing: 0.2,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: hp(1),
    height: hp(6),
    borderBottomWidth: 1.5,
    borderBottomColor: colors.border,
    paddingHorizontal: wp(1),
  },
  inputWrapperFocused: {
    borderBottomColor: colors.primaryColor,
    borderBottomWidth: 2,
  },
  input: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: fontSize(16),
    color: colors.black,
    padding: 0,
    height: '100%',
    letterSpacing: 0.2,
  },
  errorText: {
    fontFamily: fonts.regular,
    fontSize: fontSize(12),
    color: colors.error,
    marginTop: hp(0.5),
    letterSpacing: 0.2,
  },
  eyeIcon: {
    padding: wp(2),
    marginLeft: wp(1),
  },
  iconStyle: {
    width: wp(5),
    height: wp(5),
    tintColor: colors.placeHolder,
  },
  signupButton: {
    backgroundColor: colors.primaryColor,
    height: hp(6),
    borderRadius: hp(1),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp(6),
  },
  signupButtonDisabled: {
    opacity: 0.6,
  },
  signupButtonText: {
    fontFamily: fonts.bold,
    fontSize: fontSize(15),
    color: colors.white,
    letterSpacing: 0.5,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(4),
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    fontFamily: fonts.bold,
    fontSize: fontSize(13),
    color: colors.placeHolder,
    marginHorizontal: wp(4),
    letterSpacing: 0.2,
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  socialButton: {
    width: wp(12),
    height: wp(12),
    borderRadius: wp(6),
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  socialIcon: {
    width: wp(6.4),
    height: wp(6.4),
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: hp(4),
  },
  footerText: {
    fontFamily: fonts.regular,
    fontSize: fontSize(14),
    color: colors.placeHolder,
  },
  loginButton: {
    marginLeft: wp(1),
  },
  loginText: {
    fontFamily: fonts.bold,
    fontSize: fontSize(14),
    color: colors.primaryColor,
  },
});

export default SignupScreen;
