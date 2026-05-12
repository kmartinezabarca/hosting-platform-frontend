import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@application/context/AuthContext';
import type { User } from '@core/entities/models';
import logoROKE from '@presentation/assets/logo_v4.png';

// Pantalla de carga branded — se muestra mientras se verifica la sesión
const LoadingSpinner = (): React.ReactElement => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Barra de progreso animada que llega al ~85% y espera (el resto lo completa el render real)
    const steps = [
      { target: 30,  delay: 80  },
      { target: 55,  delay: 160 },
      { target: 72,  delay: 260 },
      { target: 85,  delay: 400 },
    ];
    let timeout: ReturnType<typeof setTimeout>;
    steps.forEach(({ target, delay }) => {
      timeout = setTimeout(() => setProgress(target), delay);
    });
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background">
      {/* Subtle grid background */}
      <div
        className="absolute inset-0 opacity-[0.025] dark:opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Card central */}
      <div className="relative flex flex-col items-center gap-8 px-12 py-10 rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm shadow-2xl shadow-black/10 dark:shadow-black/40 min-w-[300px]">

        {/* Logo */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="absolute -inset-3 rounded-2xl bg-primary/5 dark:bg-primary/10 blur-xl" />
            <img
              src={logoROKE}
              alt="ROKE Industries"
              className="relative h-14 w-auto object-contain drop-shadow-sm"
            />
          </div>
          <div className="text-center space-y-0.5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/70 select-none">
              Panel de Administración
            </p>
          </div>
        </div>

        {/* Barra de progreso */}
        <div className="w-full space-y-2">
          <div className="h-0.5 w-full rounded-full bg-border overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-[10px] text-center text-muted-foreground/50 font-medium tracking-wide select-none">
            Verificando sesión…
          </p>
        </div>
      </div>

      {/* Footer */}
      <p className="absolute bottom-6 text-[10px] text-muted-foreground/30 tracking-widest uppercase select-none">
        © {new Date().getFullYear()} ROKE Industries
      </p>
    </div>
  );
};

interface AccessDeniedProps {
  user: User | null;
  requiredRole: string;
}

// Componente de acceso denegado
const AccessDenied = ({ user, requiredRole }: AccessDeniedProps): React.ReactElement => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
    <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
      <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
        <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        Acceso Denegado
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        No tienes permisos para acceder a esta sección. Se requieren privilegios de {requiredRole}.
      </p>
      <div className="space-y-3">
        <button
          onClick={() => window.location.href = user?.role === 'admin' ? '/admin/dashboard' : '/client/dashboard'}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Ir a mi Panel
        </button>
        <button
          onClick={() => window.location.href = '/logout'}
          className="w-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Cerrar Sesión
        </button>
      </div>
      <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
        <p>Usuario actual: <span className="font-medium">{user?.email}</span></p>
        <p>Rol: <span className="font-medium capitalize">{user?.role}</span></p>
      </div>
    </div>
  </div>
);

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireClient?: boolean;
  allowPublic?: boolean;
}

const ProtectedRoute = ({
  children,
  requireAdmin = false,
  requireClient = false,
  allowPublic = false
}: ProtectedRouteProps): React.ReactElement | null => {
  const { 
    user, 
    isAuthenticated, 
    isAdmin, 
    isClient, 
    isAuthReady, 
    isLoading 
  } = useAuth();
  
  const location = useLocation();

  // Mostrar spinner mientras se carga la autenticación
  if (!isAuthReady || isLoading) {
    return <LoadingSpinner />;
  }

  // Si la ruta es pública, permitir acceso
  if (allowPublic) {
    return children as React.ReactElement;
  }

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Verificar permisos específicos
  if (requireAdmin && !isAdmin) {
    return <AccessDenied user={(user ?? null) as User | null} requiredRole="administrador" />;
  }

  if (requireClient && !isClient) {
    return <AccessDenied user={(user ?? null) as User | null} requiredRole="cliente" />;
  }

  // Si todo está bien, renderizar los children
  return children as React.ReactElement;
};

export default ProtectedRoute;

