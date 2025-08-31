import React, { createContext, useState, useEffect, useContext } from 'react';
import AuthService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = AuthService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const response = await AuthService.login({ email, password });
    setUser(AuthService.getCurrentUser()); // Actualizar usuario después del login
    return response;
  };

  const loginWithGoogle = async (googleToken) => {
    const response = await AuthService.loginWithGoogle(googleToken);
    setUser(AuthService.getCurrentUser()); // Actualizar usuario después del login con Google
    return response;
  };

  const verifyTwoFactor = async (email, code) => {
    const response = await AuthService.verify2FA({ email, code });
    setUser(AuthService.getCurrentUser()); // Actualizar usuario después de verificar 2FA
    return response;
  };

  const logout = async () => {
    await AuthService.logout();
    setUser(null);
  };

  const register = async (userData) => {
    const response = await AuthService.register(userData);
    setUser(AuthService.getCurrentUser()); // Actualizar usuario después del registro
    return response;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register, loginWithGoogle, verifyTwoFactor }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};


