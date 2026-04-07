import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import authService from '../services/authService';
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
  const location = useLocation();
  
  // Determinar si estamos en una ruta pública directamente aquí
  const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password', '/'];
  const isPublicRoute = publicRoutes.includes(location.pathname);
  
  // Query para obtener el usuario actual - solo ejecutar si NO estamos en ruta pública
  const userQuery = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: ({ signal }) => authService.getCurrentUser(signal),
    select: (response) => response?.data || null,
    enabled: !isPublicRoute, // NO ejecutar en rutas públicas
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false, // No reintentar si falla (importante para login)
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
  
  // Hooks de mutación para las acciones de autenticación
  const { mutateAsync: login, isPending: isLoggingIn } = useLogin();
  const { mutateAsync: logout, isPending: isLoggingOut } = useLogout();
  const { mutateAsync: register, isPending: isRegistering } = useRegister();
  const { mutateAsync: loginWithGoogle, isPending: isLoggingInWithGoogle } = useLoginWithGoogle();
  const { mutateAsync: verifyTwoFactor, isPending: isVerifying2FA } = useVerify2FA();

  // Estados derivados del query
  const user = userQuery.data;
  const isLoading = userQuery.isLoading && !isPublicRoute; // No mostrar loading en rutas públicas
  const isError = userQuery.isError;
  
  // Estados de autenticación
  const isAuthenticated = !!user?.uuid;
  const isAdmin = isAuthenticated && user?.role === 'admin';
  const isClient = isAuthenticated && user?.role === 'client';
  
  // El auth está listo cuando:
  // - Estamos en ruta pública (no necesita verificación)
  // - O cuando la query ha terminado de cargar (exitosa o con error)
  const isAuthReady = isPublicRoute || !userQuery.isLoading;

  // Marcar como inicializado cuando el auth esté listo
  useEffect(() => {
    if (isAuthReady && !isInitialized) {
      setIsInitialized(true);
    }
  }, [isAuthReady, isInitialized]);

  // Funciones mejoradas que actualizan el cache después de las acciones
  const enhancedLogin = async (...args) => {
    try {
      const result = await login(...args);
      // Refrescar los datos del usuario después del login exitoso
      await userQuery.refetch();
      return result;
    } catch (error) {
      throw error;
    }
  };

  const enhancedLogout = async (...args) => {
    try {
      const result = await logout(...args);
      // Limpiar el cache y resetear el estado
      userQuery.remove();
      setIsInitialized(false);
      return result;
    } catch (error) {
      throw error;
    }
  };

  const enhancedRegister = async (...args) => {
    try {
      const result = await register(...args);
      // Refrescar los datos del usuario después del registro exitoso
      await userQuery.refetch();
      return result;
    } catch (error) {
      throw error;
    }
  };

  const enhancedLoginWithGoogle = async (...args) => {
    try {
      const result = await loginWithGoogle(...args);
      // Refrescar los datos del usuario después del login con Google
      await userQuery.refetch();
      return result;
    } catch (error) {
      throw error;
    }
  };

  const enhancedVerifyTwoFactor = async (...args) => {
    try {
      const result = await verifyTwoFactor(...args);
      // Refrescar los datos del usuario después de verificar 2FA
      await userQuery.refetch();
      return result;
    } catch (error) {
      throw error;
    }
  };

  // Valor del contexto memoizado para evitar re-renders innecesarios
  const value = useMemo(() => ({
    // Datos del usuario
    user,
    
    // Estados de carga y error
    isLoading,
    isError,
    
    // Estados de autenticación
    isAuthenticated,
    isAdmin,
    isClient,
    isAuthReady,
    isInitialized,
    
    // Funciones de autenticación
    login: enhancedLogin,
    logout: enhancedLogout,
    register: enhancedRegister,
    loginWithGoogle: enhancedLoginWithGoogle,
    verifyTwoFactor: enhancedVerifyTwoFactor,
    
    // Estados de carga de las acciones
    isLoggingIn,
    isLoggingOut,
    isRegistering,
    isLoggingInWithGoogle,
    isVerifying2FA,
    
    // Información adicional
    isPublicRoute,
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
    isPublicRoute,
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

