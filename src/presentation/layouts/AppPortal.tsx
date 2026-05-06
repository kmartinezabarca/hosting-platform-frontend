import React, { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import './App.css'
import ProtectedRoute from '@presentation/components/features/components/ProtectedRoute'
import ErrorBoundary from '@presentation/components/features/components/ErrorBoundary'

const ClientLayout  = lazy(() => import('./components/ClientLayout'))
const LoginPage     = lazy(() => import('./pages/LoginPage'))
const RegisterPage  = lazy(() => import('./pages/RegisterPage'))
const Verify2FAPage = lazy(() => import('./pages/Verify2FAPage'))
const CompleteProfilePage = lazy(() => import('./pages/auth/CompleteProfilePage'));
const SetupUsernamePage   = lazy(() => import('./pages/auth/SetupUsernamePage'));
const ProfileDemo   = lazy(() => import('./pages/ProfileDemo'));
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
          <Route path="/auth/complete-profile" element={<CompleteProfilePage />} />
          <Route path="/auth/setup-username"   element={<SetupUsernamePage />} />
          <Route path="/profile-demo"          element={<ProfileDemo />} />

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