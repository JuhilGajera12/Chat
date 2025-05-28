import React, {useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {fonts} from '../constant/fonts';
import {fontSize, hp, wp} from '../helpers/globalFunction';
import {colors} from '../constant/colors';
import {icons} from '../constant/icons';
import {useAuth, useSession} from '../hooks';
import {useLoginForm} from '../hooks/useForm';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/types';
import {CommonActions} from '@react-navigation/native';

type LoginScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Login'
>;

interface LoginScreenProps {
  navigation: LoginScreenNavigationProp;
}

const LoginScreen: React.FC<LoginScreenProps> = ({navigation}) => {
  const {
    email,
    password,
    showPassword,
    setEmail,
    setPassword,
    togglePasswordVisibility,
    resetForm,
  } = useLoginForm();

  const {
    signInWithEmail,
    resetPassword,
    loading: authLoading,
    error: authError,
    user,
  } = useAuth();
  const {
    saveUserSession,
    loading: sessionLoading,
    error: sessionError,
  } = useSession();

  const loading = authLoading || sessionLoading;

  useEffect(() => {
    if (authError) {
      Alert.alert('Error', authError.message);
    }
    if (sessionError) {
      Alert.alert('Error', sessionError.message);
    }
  }, [authError, sessionError]);

  useEffect(() => {
    if (user) {
      saveUserSession(user);
      resetForm();
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{name: 'ChatList'}],
        }),
      );
    }
  }, [user, saveUserSession, resetForm, navigation]);

  const handleLogin = async () => {
    if (!email || !password) {
      return;
    }

    try {
      await signInWithEmail(email, password);
    } catch (error) {}
  };

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    try {
      await resetPassword(email);
      Alert.alert(
        'Success',
        'Password reset email sent. Please check your inbox.',
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to send reset email');
    }
  };

  const handleSignup = () => {
    resetForm();
    navigation.navigate('Signup');
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
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.contentContainer}>
            <View style={styles.headerContainer}>
              <Text style={styles.welcomeText}>Welcome Back</Text>
              <Text style={styles.subtitleText}>
                We're excited to see you again!
              </Text>
            </View>

            <View style={styles.formContainer}>
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
                    placeholder="Enter your password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    placeholderTextColor={colors.placeHolder}
                  />
                  <TouchableOpacity
                    onPress={togglePasswordVisibility}
                    style={styles.eyeIcon}>
                    <Image
                      source={showPassword ? icons.eyeOpen : icons.eyeClosed}
                      style={styles.iconStyle}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                style={styles.forgotPassword}
                onPress={handleForgotPassword}>
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.loginButton,
                  (!email || !password || loading) &&
                    styles.loginButtonDisabled,
                ]}
                onPress={handleLogin}
                disabled={!email || !password || loading}>
                {loading ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={styles.loginButtonText}>Sign In</Text>
                )}
              </TouchableOpacity>

              <View style={styles.signupContainer}>
                <Text style={styles.signupText}>Don't have an account? </Text>
                <TouchableOpacity onPress={handleSignup}>
                  <Text style={styles.signupLink}>Sign Up</Text>
                </TouchableOpacity>
              </View>
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
    fontFamily: fonts.black,
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
  eyeIcon: {
    padding: wp(2),
    marginLeft: wp(1),
  },
  iconStyle: {
    width: wp(5),
    height: wp(5),
    tintColor: colors.placeHolder,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: hp(4),
    paddingVertical: hp(1),
  },
  forgotPasswordText: {
    fontFamily: fonts.regular,
    fontSize: fontSize(14),
    color: colors.primaryColor,
    letterSpacing: 0.2,
  },
  loginButton: {
    backgroundColor: colors.primaryColor,
    borderRadius: hp(1),
    height: hp(6),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp(4),
  },
  loginButtonDisabled: {
    opacity: 0.5,
  },
  loginButtonText: {
    fontFamily: fonts.bold,
    fontSize: fontSize(16),
    color: colors.white,
    letterSpacing: 0.2,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    fontFamily: fonts.regular,
    fontSize: fontSize(14),
    color: colors.black,
    letterSpacing: 0.2,
  },
  signupLink: {
    fontFamily: fonts.bold,
    fontSize: fontSize(14),
    color: colors.primaryColor,
    letterSpacing: 0.2,
  },
});

export default React.memo(LoginScreen);
