import React from 'react';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
   const { user, isAdmin } = useAuth(); 

  // Check if admin access is required
  if (requireAdmin && !isAdmin) {
    return (
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
            No tienes permisos para acceder a esta sección. Se requieren privilegios de administrador.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => window.location.href = '/client/dashboard'}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Ir al Panel de Cliente
            </button>
            <button
              onClick={() => authService.logout().then(() => window.location.href = '/login')}
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
  }

  return children;
};

export default ProtectedRoute;

