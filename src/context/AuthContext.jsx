import React, { createContext, useContext, useMemo, useEffect, useState } from 'react';
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
  const [isInitialized, setIsInitialized] = useState(false);
  const userQuery = useCurrentUser(); 
  
  const { mutateAsync: login, isPending: isLoggingIn } = useLogin();
  const { mutateAsync: logout, isPending: isLoggingOut } = useLogout();
  const { mutateAsync: register, isPending: isRegistering } = useRegister();
  const { mutateAsync: loginWithGoogle, isPending: isLoggingInWithGoogle } = useLoginWithGoogle();
  const { mutateAsync: verifyTwoFactor, isPending: isVerifying2FA } = useVerify2FA();

  const user = userQuery.data ?? null;
  const isLoading = userQuery.isLoading;
  const isError = userQuery.isError;
  
  // Estados de autenticación más robustos
  const isAuthenticated = !!user?.uuid;
  const isAdmin = isAuthenticated && user?.role === 'admin';
  const isClient = isAuthenticated && user?.role === 'client';
  
  // Estado de inicialización: true cuando ya se completó la primera carga (exitosa o fallida)
  const isAuthReady = !isLoading && isInitialized;

  // Marcar como inicializado cuando termine la primera carga
  useEffect(() => {
    if (!isLoading && !isInitialized) {
      setIsInitialized(true);
    }
  }, [isLoading, isInitialized]);

  // Funciones de autenticación mejoradas
  const enhancedLogin = async (...args) => {
    const result = await login(...args);
    // Invalidar y refetch del usuario después del login
    userQuery.refetch();
    return result;
  };

  const enhancedLogout = async (...args) => {
    const result = await logout(...args);
    // Limpiar datos del usuario después del logout
    userQuery.remove();
    setIsInitialized(false);
    return result;
  };

  const enhancedRegister = async (...args) => {
    const result = await register(...args);
    // Refetch del usuario después del registro
    userQuery.refetch();
    return result;
  };

  const enhancedLoginWithGoogle = async (...args) => {
    const result = await loginWithGoogle(...args);
    // Refetch del usuario después del login con Google
    userQuery.refetch();
    return result;
  };

  const enhancedVerifyTwoFactor = async (...args) => {
    const result = await verifyTwoFactor(...args);
    // Refetch del usuario después de verificar 2FA
    userQuery.refetch();
    return result;
  };

  const value = useMemo(() => ({
    // Datos y estado del usuario
    user,
    isLoading,
    isError,
    isAuthenticated,
    isAdmin,
    isClient,
    isAuthReady, // Nuevo: indica si la autenticación está lista para usar
    isInitialized, // Nuevo: indica si ya se completó la inicialización

    // Acciones de mutación mejoradas
    login: enhancedLogin,
    logout: enhancedLogout,
    register: enhancedRegister,
    loginWithGoogle: enhancedLoginWithGoogle,
    verifyTwoFactor: enhancedVerifyTwoFactor,

    // Estados de las mutaciones
    isLoggingIn,
    isLoggingOut,
    isRegistering,
    isLoggingInWithGoogle,
    isVerifying2FA,

    // Métodos de utilidad
    refetchUser: userQuery.refetch,
  }), [
    user, isLoading, isError, isAuthenticated, isAdmin, isClient, isAuthReady, isInitialized,
    enhancedLogin, enhancedLogout, enhancedRegister, enhancedLoginWithGoogle, enhancedVerifyTwoFactor,
    isLoggingIn, isLoggingOut, isRegistering, isLoggingInWithGoogle, isVerifying2FA,
    userQuery.refetch
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

