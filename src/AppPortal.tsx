import React, { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import './App.css'
import ProtectedRoute from './components/ProtectedRoute'
import ErrorBoundary from './components/ErrorBoundary'

const ClientLayout  = lazy(() => import('./components/ClientLayout'))
const LoginPage     = lazy(() => import('./pages/LoginPage'))
const RegisterPage  = lazy(() => import('./pages/RegisterPage'))
const Verify2FAPage = lazy(() => import('./pages/Verify2FAPage'))
const NotFoundPage  = lazy(() => import('./pages/NotFoundPage'))

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
  </div>
)

export default function AppPortal() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/login"      element={<LoginPage />} />
          <Route path="/register"   element={<RegisterPage />} />
          <Route path="/verify-2fa" element={<Verify2FAPage />} />

          <Route
            path="/client/*"
            element={
              <ProtectedRoute>
                <ClientLayout />
              </ProtectedRoute>
            }
          />

          <Route path="/"  element={<LoginPage />} />
          <Route path="*"  element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  )
}