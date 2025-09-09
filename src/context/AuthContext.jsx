import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from 'react';
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
  const initializationRef = useRef(false);
  
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

  // Marcar como inicializado cuando termine la primera carga - solo una vez
  useEffect(() => {
    if (!isLoading && !initializationRef.current) {
      initializationRef.current = true;
      setIsInitialized(true);
      console.log('AuthContext: Inicialización completada', { 
        isAuthenticated, 
        user: user?.email || 'No user',
        isError 
      });
    }
  }, [isLoading, isAuthenticated, user?.email, isError]);

  // Funciones de autenticación mejoradas
  const enhancedLogin = async (...args) => {
    try {
      const result = await login(...args);
      // Invalidar y refetch del usuario después del login
      await userQuery.refetch();
      console.log('AuthContext: Login exitoso, usuario refetcheado');
      return result;
    } catch (error) {
      console.error('AuthContext: Error en login:', error);
      throw error;
    }
  };

  const enhancedLogout = async (...args) => {
    try {
      const result = await logout(...args);
      // Limpiar datos del usuario después del logout
      userQuery.remove();
      setIsInitialized(false);
      initializationRef.current = false;
      console.log('AuthContext: Logout exitoso, datos limpiados');
      return result;
    } catch (error) {
      console.error('AuthContext: Error en logout:', error);
      throw error;
    }
  };

  const enhancedRegister = async (...args) => {
    try {
      const result = await register(...args);
      // Refetch del usuario después del registro
      await userQuery.refetch();
      console.log('AuthContext: Registro exitoso, usuario refetcheado');
      return result;
    } catch (error) {
      console.error('AuthContext: Error en registro:', error);
      throw error;
    }
  };

  const enhancedLoginWithGoogle = async (...args) => {
    try {
      const result = await loginWithGoogle(...args);
      // Refetch del usuario después del login con Google
      await userQuery.refetch();
      console.log('AuthContext: Login con Google exitoso, usuario refetcheado');
      return result;
    } catch (error) {
      console.error('AuthContext: Error en login con Google:', error);
      throw error;
    }
  };

  const enhancedVerifyTwoFactor = async (...args) => {
    try {
      const result = await verifyTwoFactor(...args);
      // Refetch del usuario después de verificar 2FA
      await userQuery.refetch();
      console.log('AuthContext: 2FA verificado exitosamente, usuario refetcheado');
      return result;
    } catch (error) {
      console.error('AuthContext: Error en verificación 2FA:', error);
      throw error;
    }
  };

  // Función para refrescar manualmente los datos del usuario
  const refetchUser = async () => {
    try {
      const result = await userQuery.refetch();
      console.log('AuthContext: Usuario refetcheado manualmente');
      return result;
    } catch (error) {
      console.error('AuthContext: Error al refetchear usuario:', error);
      throw error;
    }
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

    // Utilidades
    refetchUser,
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

