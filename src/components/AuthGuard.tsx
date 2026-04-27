import React from 'react';
import { useAuth } from '../context/AuthContext';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
  requireClient?: boolean;
  onUnauthorized?: ((reason: string) => void) | null;
}

/**
 * AuthGuard - Componente para proteger la ejecución de componentes hasta que la autenticación esté lista
 */
const AuthGuard = ({
  children,
  fallback = null,
  requireAuth = true,
  requireAdmin = false,
  requireClient = false,
  onUnauthorized = null,
}: AuthGuardProps) => {
  const { 
    isAuthenticated, 
    isAdmin, 
    isClient, 
    isAuthReady, 
    isLoading 
  } = useAuth();

  // Mostrar fallback mientras se carga la autenticación
  if (!isAuthReady || isLoading) {
    return fallback || (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Verificar autenticación si es requerida
  if (requireAuth && !isAuthenticated) {
    if (onUnauthorized) {
      onUnauthorized('not_authenticated');
    }
    return null;
  }

  // Verificar permisos de admin si es requerido
  if (requireAdmin && !isAdmin) {
    if (onUnauthorized) {
      onUnauthorized('not_admin');
    }
    return null;
  }

  // Verificar permisos de cliente si es requerido
  if (requireClient && !isClient) {
    if (onUnauthorized) {
      onUnauthorized('not_client');
    }
    return null;
  }

  // Si todo está bien, renderizar los children
  return children;
};

export default AuthGuard;

