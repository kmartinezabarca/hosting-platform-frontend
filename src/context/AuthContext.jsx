import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useQuery } from '@tanstack/react-query';
import authService from '../services/authService';
import { useRouteContext } from '../components/AuthWrapper';
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
  const { isPublicRoute } = useRouteContext() || { isPublicRoute: false };
  
  // UNA SOLA QUERY - NO ejecutar en rutas públicas
  const userQuery = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: ({ signal }) => authService.getCurrentUser(signal),
    select: (u) => u?.data || null,
    enabled: !isPublicRoute, // NO ejecutar en rutas públicas
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false, // No reintentar si falla (importante para login)
    staleTime: 5 * 60 * 1000,
  });
  
  const { mutateAsync: login, isPending: isLoggingIn } = useLogin();
  const { mutateAsync: logout, isPending: isLoggingOut } = useLogout();
  const { mutateAsync: register, isPending: isRegistering } = useRegister();
  const { mutateAsync: loginWithGoogle, isPending: isLoggingInWithGoogle } = useLoginWithGoogle();
  const { mutateAsync: verifyTwoFactor, isPending: isVerifying2FA } = useVerify2FA();

  const user = userQuery.data;
  const isLoading = userQuery.isLoading;
  const isError = userQuery.isError;
  
  // Estados simples
  const isAuthenticated = !!user?.uuid;
  const isAdmin = isAuthenticated && user?.role === 'admin';
  const isClient = isAuthenticated && user?.role === 'client';
  const isAuthReady = !isLoading; // SIMPLE: cuando no está cargando, está listo

  // Marcar como inicializado cuando termine la primera carga
  useEffect(() => {
    if (!isLoading && !isInitialized) {
      setIsInitialized(true);
    }
  }, [isLoading, isInitialized]);

  // Funciones simples
  const enhancedLogin = async (...args) => {
    const result = await login(...args);
    userQuery.refetch();
    return result;
  };

  const enhancedLogout = async (...args) => {
    const result = await logout(...args);
    userQuery.remove();
    setIsInitialized(false);
    return result;
  };

  const enhancedRegister = async (...args) => {
    const result = await register(...args);
    userQuery.refetch();
    return result;
  };

  const enhancedLoginWithGoogle = async (...args) => {
    const result = await loginWithGoogle(...args);
    userQuery.refetch();
    return result;
  };

  const enhancedVerifyTwoFactor = async (...args) => {
    const result = await verifyTwoFactor(...args);
    userQuery.refetch();
    return result;
  };

  const value = useMemo(() => ({
    user,
    isLoading,
    isError,
    isAuthenticated,
    isAdmin,
    isClient,
    isAuthReady,
    isInitialized,
    login: enhancedLogin,
    logout: enhancedLogout,
    register: enhancedRegister,
    loginWithGoogle: enhancedLoginWithGoogle,
    verifyTwoFactor: enhancedVerifyTwoFactor,
    isLoggingIn,
    isLoggingOut,
    isRegistering,
    isLoggingInWithGoogle,
    isVerifying2FA,
  }), [
    user,
    isLoading,
    isError,
    isAuthenticated,
    isAdmin,
    isClient,
    isAuthReady,
    isInitialized,
    isLoggingIn,
    isLoggingOut,
    isRegistering,
    isLoggingInWithGoogle,
    isVerifying2FA,
  ]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
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

