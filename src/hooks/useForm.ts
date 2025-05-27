import {useState, useCallback} from 'react';

interface LoginFormState {
  email: string;
  password: string;
  showPassword: boolean;
}

interface SignupFormState {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  showPassword: boolean;
  showConfirmPassword: boolean;
}

export const useLoginForm = () => {
  const [form, setForm] = useState<LoginFormState>({
    email: '',
    password: '',
    showPassword: false,
  });

  const setEmail = useCallback((email: string) => {
    setForm(prev => ({...prev, email}));
  }, []);

  const setPassword = useCallback((password: string) => {
    setForm(prev => ({...prev, password}));
  }, []);

  const togglePasswordVisibility = useCallback(() => {
    setForm(prev => ({...prev, showPassword: !prev.showPassword}));
  }, []);

  const resetForm = useCallback(() => {
    setForm({
      email: '',
      password: '',
      showPassword: false,
    });
  }, []);

  return {
    ...form,
    setEmail,
    setPassword,
    togglePasswordVisibility,
    resetForm,
  };
};

export const useSignupForm = () => {
  const [form, setForm] = useState<SignupFormState>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    showPassword: false,
    showConfirmPassword: false,
  });

  const setName = useCallback((name: string) => {
    setForm(prev => ({...prev, name}));
  }, []);

  const setEmail = useCallback((email: string) => {
    setForm(prev => ({...prev, email}));
  }, []);

  const setPassword = useCallback((password: string) => {
    setForm(prev => ({...prev, password}));
  }, []);

  const setConfirmPassword = useCallback((confirmPassword: string) => {
    setForm(prev => ({...prev, confirmPassword}));
  }, []);

  const togglePasswordVisibility = useCallback(() => {
    setForm(prev => ({...prev, showPassword: !prev.showPassword}));
  }, []);

  const toggleConfirmPasswordVisibility = useCallback(() => {
    setForm(prev => ({...prev, showConfirmPassword: !prev.showConfirmPassword}));
  }, []);

  const resetForm = useCallback(() => {
    setForm({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      showPassword: false,
      showConfirmPassword: false,
    });
  }, []);

  return {
    ...form,
    setName,
    setEmail,
    setPassword,
    setConfirmPassword,
    togglePasswordVisibility,
    toggleConfirmPasswordVisibility,
    resetForm,
  };
}; 