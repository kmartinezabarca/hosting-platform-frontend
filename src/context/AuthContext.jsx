import React, { createContext, useState, useEffect, useContext } from 'react';
import AuthService from '../services/auth';

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
    const response = await AuthService.login(email, password);
    setUser(response);
    return response;
  };

  const logout = () => {
    AuthService.logout();
    setUser(null);
  };

  const register = async (name, email, password, password_confirmation) => {
    const response = await AuthService.register(name, email, password, password_confirmation);
    // Optionally log in after registration
    // setUser(response.data);
    return response;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};


