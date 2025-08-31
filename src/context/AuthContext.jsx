import React, { createContext, useState, useEffect, useContext } from 'react';
import authService from '@/services/authService';
import { useQueryClient } from '@tanstack/react-query';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]   = useState(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  // Al montar, si hay token → traer usuario real
  // useEffect(() => {
  //   const boot = async () => {
  //     try {
  //       if (authService.isAuthenticated()) {
  //         const me = await authService.getCurrentUser();
  //         setUser(me);
  //       }
  //     } catch {
  //       // token inválido
  //       localStorage.removeItem('auth_token');
  //       setUser(null);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   boot();
  // }, []);

  const login = async (email, password) => {
    const res = await authService.login({ email, password });
    const me = await authService.getCurrentUser();
    setUser(me);
    await queryClient.invalidateQueries({ queryKey: ['profile'] }); // si usas react-query en otras vistas
    return res;
  };

  const loginWithGoogle = async (googleData) => {
    const res = await authService.loginWithGoogle(googleData);
    const me = await authService.getCurrentUser();
    setUser(me);
    await queryClient.invalidateQueries({ queryKey: ['profile'] });
    return res;
  };

  const verifyTwoFactor = async (email, code) => {
    const res = await authService.verify2FA({ email, code });
    const me = await authService.getCurrentUser();
    setUser(me);
    await queryClient.invalidateQueries({ queryKey: ['profile'] });
    return res;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    await queryClient.removeQueries({ queryKey: ['profile'] });
  };

  const register = async (payload) => {
    const res = await authService.register(payload);
    const me = await authService.getCurrentUser();
    setUser(me);
    await queryClient.invalidateQueries({ queryKey: ['profile'] });
    return res;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register, loginWithGoogle, verifyTwoFactor }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
