import React, {useEffect} from 'react';
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
  ActivityIndicator,
  Alert,
} from 'react-native';
import {fonts} from '../constant/fonts';
import {
  fontSize,
  hp,
  wp,
  commonAction,
  navigate,
} from '../helpers/globalFunction';
import {colors} from '../constant/colors';
import {icons} from '../constant/icons';
import {useAuth} from '../hooks';
import {useSignupForm} from '../hooks/useForm';

const SignupScreen = () => {
  const {
    name,
    email,
    password,
    confirmPassword,
    showPassword,
    showConfirmPassword,
    setName,
    setEmail,
    setPassword,
    setConfirmPassword,
    togglePasswordVisibility,
    toggleConfirmPasswordVisibility,
    resetForm,
  } = useSignupForm();

  const {
    signUpWithEmail,
    createUserProfile,
    loading: authLoading,
    error: authError,
    user,
  } = useAuth();

  const isFormValid =
    name &&
    email &&
    password &&
    confirmPassword &&
    password === confirmPassword;

  useEffect(() => {
    if (authError) {
      Alert.alert('Error', authError.message);
    }
  }, [authError]);

  useEffect(() => {
    const setupUser = async () => {
      if (user) {
        try {
          // Update user profile with name in Auth
          await user.updateProfile({
            displayName: name,
          });

          // Create user profile in Firestore
          await createUserProfile(user, name);

          // Reset form and navigate
          resetForm();
          commonAction('ChatList');
        } catch (error: any) {
          Alert.alert('Error', error.message || 'Failed to setup user profile');
        }
      }
    };

    setupUser();
  }, [user, name, createUserProfile, resetForm]);

  const handleSignup = async () => {
    if (!isFormValid) {
      return;
    }

    try {
      await signUpWithEmail(email, password);
    } catch (error) {
      // Error is handled by useEffect
    }
  };

  const handleLogin = () => {
    resetForm();
    navigate('Login');
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
              <Text style={styles.welcomeText}>Create Account</Text>
              <Text style={styles.subtitleText}>
                Join us and start chatting with friends!
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
                    autoCapitalize="words"
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
                    onPress={toggleConfirmPasswordVisibility}
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
              </View>

              <TouchableOpacity
                style={[
                  styles.signupButton,
                  (!isFormValid || authLoading) && styles.signupButtonDisabled,
                ]}
                onPress={handleSignup}
                disabled={!isFormValid || authLoading}>
                {authLoading ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={styles.signupButtonText}>Sign Up</Text>
                )}
              </TouchableOpacity>

              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>Already have an account? </Text>
                <TouchableOpacity onPress={handleLogin}>
                  <Text style={styles.loginLink}>Sign In</Text>
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
  signupButton: {
    backgroundColor: colors.primaryColor,
    borderRadius: hp(1),
    height: hp(6),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp(4),
  },
  signupButtonDisabled: {
    opacity: 0.5,
  },
  signupButtonText: {
    fontFamily: fonts.bold,
    fontSize: fontSize(16),
    color: colors.white,
    letterSpacing: 0.2,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontFamily: fonts.regular,
    fontSize: fontSize(14),
    color: colors.black,
    letterSpacing: 0.2,
  },
  loginLink: {
    fontFamily: fonts.bold,
    fontSize: fontSize(14),
    color: colors.primaryColor,
    letterSpacing: 0.2,
  },
});

export default React.memo(SignupScreen);
