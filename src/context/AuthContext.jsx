import React, { createContext, useContext } from 'react';
import { useCurrentUser } from '../hooks/useCurrentUser';
import {
  useLogin,
  useLogout,
  useRegister,
  useLoginWithGoogle,
  useVerify2FA,
} from '../hooks/useAuth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const { data: user, isLoading, isError } = useCurrentUser();

  const { mutate: login, isPending: isLoggingIn } = useLogin();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();
  const { mutate: register, isPending: isRegistering } = useRegister();
  const { mutate: loginWithGoogle, isPending: isLoggingInWithGoogle } = useLoginWithGoogle();
  const { mutate: verifyTwoFactor, isPending: isVerifying2FA } = useVerify2FA();

  const isAuthenticated = !!user && !isError;

  const value = {
    user,
    isLoading, // Carga inicial del usuario
    isAuthenticated,

    // Acciones de mutación
    login,
    logout,
    register,
    loginWithGoogle,
    verifyTwoFactor,

    // Estados de las mutaciones
    isLoggingIn,
    isLoggingOut,
    isRegistering,
    isLoggingInWithGoogle,
    isVerifying2FA,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
