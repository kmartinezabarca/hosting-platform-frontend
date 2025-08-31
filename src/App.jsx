import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

import AdminLayout from './components/AdminLayout';
import ClientLayout from './components/ClientLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Verify2FAPage from './pages/Verify2FAPage';
import ProfileDemo from './pages/ProfileDemo';
import ProtectedRoute from './components/ProtectedRoute';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      refetchOnWindowFocus: false,
      retry: 2,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-2fa" element={<Verify2FAPage />} />
        <Route path="/profile-demo" element={<ProfileDemo />} />

        {/* Client Routes - Protected */}
        <Route 
          path="/client/*" 
          element={
            <ProtectedRoute>
              <ClientLayout />
            </ProtectedRoute>
          } 
        />

        {/* Admin Routes - Protected with Admin Role */}
        <Route 
          path="/admin/*" 
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminLayout />
            </ProtectedRoute>
          } 
        />

        {/* Default Route */}
        <Route path="/" element={
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100  dark:to-gray-800 flex items-center justify-center">
            <div className="text-center">
              <img src="/logo.png" alt="ROKE Industries" className="h-40 mx-auto mb-8" />
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Bienvenido a ROKE Industries
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                Tu plataforma de hosting tecnológica y moderna
              </p>
              <div className="space-x-4">
                <a 
                  href="/login" 
                  className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                >
                  Iniciar Sesión
                </a>
                <a 
                  href="/register" 
                  className="inline-block bg-white hover:bg-gray-50 text-blue-600 font-medium py-3 px-6 rounded-lg border border-blue-600 transition-colors"
                >
                  Registrarse
                </a>
              </div>
            </div>
          </div>
        } />
      </Routes>
    </Router>
    <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
