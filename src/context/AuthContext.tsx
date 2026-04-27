import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import authService from '../services/authService';
import { setSentryUser } from '@/lib/sentry';
import {
  useLogin,
  useLogout,
  useRegister,
  useLoginWithGoogle,
  useVerify2FA,
} from '../hooks/useAuth';
import type { User } from '@/types/models';

// ─── Tipos del contexto ────────────────────────────────────────────────────

interface AuthContextValue {
  // Datos del usuario
  user: User | null | undefined;

  // Estados de carga y error
  isLoading: boolean;
  isError: boolean;

  // Estados de autenticación
  isAuthenticated: boolean;
  isAdmin: boolean;
  isClient: boolean;
  isAuthReady: boolean;
  isInitialized: boolean;

  // Funciones de autenticación
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  login: (...args: any[]) => Promise<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  logout: (...args: any[]) => Promise<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: (...args: any[]) => Promise<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  loginWithGoogle: (...args: any[]) => Promise<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  verifyTwoFactor: (...args: any[]) => Promise<any>;

  // Estados de carga de las acciones
  isLoggingIn: boolean;
  isLoggingOut: boolean;
  isRegistering: boolean;
  isLoggingInWithGoogle: boolean;
  isVerifying2FA: boolean;

  // Información adicional
  isPublicRoute: boolean;
}

// ─── Contexto ──────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Rutas públicas (no requieren autenticación) ───────────────────────────

const PUBLIC_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password', '/'];

// ─── Provider ──────────────────────────────────────────────────────────────

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const location = useLocation();
  const queryClient = useQueryClient();

  const isPublicRoute = PUBLIC_ROUTES.includes(location.pathname);

  // Query para obtener el usuario actual — solo ejecutar si NO estamos en ruta pública
  const userQuery = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: ({ signal }) => authService.getCurrentUser(signal),
    select: (response) => (response?.data as User) || null,
    enabled: !isPublicRoute,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  // Hooks de mutación
  const { mutateAsync: login, isPending: isLoggingIn } = useLogin();
  const { mutateAsync: logout, isPending: isLoggingOut } = useLogout();
  const { mutateAsync: register, isPending: isRegistering } = useRegister();
  const { mutateAsync: loginWithGoogle, isPending: isLoggingInWithGoogle } = useLoginWithGoogle();
  const { mutateAsync: verifyTwoFactor, isPending: isVerifying2FA } = useVerify2FA();

  // Estados derivados del query
  const user = userQuery.data;
  const isLoading = userQuery.isLoading && !isPublicRoute;
  const isError = userQuery.isError;

  // Estados de autenticación
  const isAuthenticated = !!user?.uuid;
  const isAdmin = isAuthenticated && user?.role === 'admin';
  const isClient = isAuthenticated && user?.role === 'client';

  // El auth está listo cuando estamos en ruta pública o la query terminó
  const isAuthReady = isPublicRoute || !userQuery.isLoading;

  useEffect(() => {
    if (isAuthReady && !isInitialized) {
      setIsInitialized(true);
    }
  }, [isAuthReady, isInitialized]);

  // Sincronizar usuario con Sentry para contexto en errores
  useEffect(() => {
    setSentryUser(user ?? null);
  }, [user]);

  // Funciones mejoradas que actualizan el cache después de las acciones
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const enhancedLogin = async (...args: any[]) => {
    const result = await (login as any)(...args);
    await userQuery.refetch();
    return result;
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const enhancedLogout = async (...args: any[]) => {
    const result = await (logout as any)(...args);
    queryClient.removeQueries({ queryKey: ['auth', 'me'] });
    setIsInitialized(false);
    return result;
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const enhancedRegister = async (...args: any[]) => {
    const result = await (register as any)(...args);
    await userQuery.refetch();
    return result;
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const enhancedLoginWithGoogle = async (...args: any[]) => {
    const result = await (loginWithGoogle as any)(...args);
    await userQuery.refetch();
    return result;
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const enhancedVerifyTwoFactor = async (...args: any[]) => {
    const result = await (verifyTwoFactor as any)(...args);
    await userQuery.refetch();
    return result;
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user: user ?? null,
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
      isPublicRoute,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
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
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// ─── Hook ──────────────────────────────────────────────────────────────────

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
