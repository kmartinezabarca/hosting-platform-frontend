import React, { createContext, useContext } from 'react';
import { useCurrentUser } from '@/hooks/useAuth';
import {  useLogin, useLoginWithGoogle, useVerify2FA, useLogout, useRegister } from '@/hooks/useAuth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {

  const { data: user, isLoading: loading, refetch: refetchUser } = useCurrentUser();

  const { mutateAsync: loginMutation } = useLogin();
  const login = async (email, password) => {
    const res = await loginMutation({ email, password });
    return res;
  };

  const { mutateAsync: loginWithGoogleMutation } = useLoginWithGoogle();
  const loginWithGoogle = async (googleData) => {
    const res = await loginWithGoogleMutation(googleData);
    return res;
  };

  const { mutateAsync: verifyTwoFactorMutation } = useVerify2FA();
  const verifyTwoFactor = async (email, code) => {
    const res = await verifyTwoFactorMutation({ email, code });
    return res;
  };

  const { mutateAsync: logoutMutation } = useLogout();
  const logout = async () => {
    await logoutMutation();
  };

  const { mutateAsync: registerMutation } = useRegister();
  const register = async (payload) => {
    const res = await registerMutation(payload);
    return res;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register, loginWithGoogle, verifyTwoFactor, refetchUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
