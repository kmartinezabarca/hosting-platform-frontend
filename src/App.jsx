import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';

import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';

const AdminLayout   = lazy(() => import('./components/AdminLayout'));
const ClientLayout  = lazy(() => import('./components/ClientLayout'));
const LoginPage     = lazy(() => import('./pages/LoginPage'));
const RegisterPage  = lazy(() => import('./pages/RegisterPage'));
const Verify2FAPage = lazy(() => import('./pages/Verify2FAPage'));
const ProfileDemo   = lazy(() => import('./pages/ProfileDemo'));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/login"        element={<LoginPage />} />
          <Route path="/register"     element={<RegisterPage />} />
          <Route path="/verify-2fa"   element={<Verify2FAPage />} />
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
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:to-gray-800 flex items-center justify-center">
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
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;
