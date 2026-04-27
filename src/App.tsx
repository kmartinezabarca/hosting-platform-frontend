import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';

import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';

const AdminLayout   = lazy(() => import('./components/AdminLayout'));
const ClientLayout  = lazy(() => import('./components/ClientLayout'));
const LoginPage     = lazy(() => import('./pages/LoginPage'));
const RegisterPage  = lazy(() => import('./pages/RegisterPage'));
const Verify2FAPage  = lazy(() => import('./pages/Verify2FAPage'));
const ProfileDemo   = lazy(() => import('./pages/ProfileDemo'));
const NotFoundPage  = lazy(() => import('./pages/NotFoundPage'));

const PageLoader = (): React.ReactElement => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
  </div>
);

function App(): React.ReactElement {
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
          <Route path="/"        element={<LoginPage />} />

          {/* 404 - Catch all undefined routes */}
          <Route path="*"        element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;
