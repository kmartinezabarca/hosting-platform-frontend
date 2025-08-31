import React, { createContext, useState, useEffect, useContext } from 'react';
import authService from '@/services/authService';
import { useQueryClient } from '@tanstack/react-query';
import { useCurrentUser } from '@/hooks/useAuth'; // Importar el nuevo hook

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const queryClient = useQueryClient();
  const { data: user, isLoading: loading, refetch: refetchUser } = useCurrentUser(); // Usar el hook useCurrentUser

  // Las funciones de login, register, etc., ahora invalidarán la caché de 'auth', 'me'
  // para que useCurrentUser refetchee automáticamente.

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
