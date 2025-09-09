import React, { createContext, useContext, useMemo } from 'react'; // 1. Importa useMemo
import PropTypes from 'prop-types';
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
  const userQuery = useCurrentUser(); 
  
  const { mutateAsync: login, isPending: isLoggingIn } = useLogin();
  const { mutateAsync: logout, isPending: isLoggingOut } = useLogout();
  const { mutateAsync: register, isPending: isRegistering } = useRegister();
  const { mutateAsync: loginWithGoogle, isPending: isLoggingInWithGoogle } = useLoginWithGoogle();
  const { mutateAsync: verifyTwoFactor, isPending: isVerifying2FA } = useVerify2FA();

  const user = userQuery.data ?? null;
  const isLoading = userQuery.isLoading;
  const isAuthenticated= !!user?.id; 
  const isAdmin = isAuthenticated && user.role === 'admin';
  const isClient = isAuthenticated && user.role === 'client';

  const value = useMemo(() => ({
    // Datos y estado del usuario
    user,
    isLoading,
    isAuthenticated,
    isAdmin,
    isClient,

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
  }), [
    user, isLoading, isAuthenticated, isAdmin, isClient,
    login, logout, register, loginWithGoogle, verifyTwoFactor,
    isLoggingIn, isLoggingOut, isRegistering, isLoggingInWithGoogle, isVerifying2FA
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};