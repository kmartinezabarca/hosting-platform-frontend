import React, { createContext, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';

// Contexto simple para indicar si estamos en ruta pública
const RouteContext = createContext({ isPublicRoute: false });

export const useRouteContext = () => useContext(RouteContext);

export const AuthWrapper = ({ children }) => {
  const location = useLocation();
  
  // Rutas públicas donde NO se debe hacer la query
  const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];
  const isPublicRoute = publicRoutes.includes(location.pathname);
  
  return (
    <RouteContext.Provider value={{ isPublicRoute }}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </RouteContext.Provider>
  );
};

