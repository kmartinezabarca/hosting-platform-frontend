import React, { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import '@presentation/styles/App.css'
import ProtectedRoute from '@presentation/components/features/ProtectedRoute'
import ErrorBoundary from '@presentation/components/features/ErrorBoundary'

const ClientLayout  = lazy(() => import('@presentation/components/features/ClientLayout'))
const LoginPage     = lazy(() => import('@presentation/pages/LoginPage'))
const RegisterPage  = lazy(() => import('@presentation/pages/RegisterPage'))
const Verify2FAPage = lazy(() => import('@presentation/pages/Verify2FAPage'))
const CompleteProfilePage = lazy(() => import('@presentation/pages/CompleteProfilePage'))
const SetupUsernamePage   = lazy(() => import('@presentation/pages/SetupUsernamePage'))
const ProfileDemo   = lazy(() => import('@presentation/pages/ProfileDemo'))
const NotFoundPage  = lazy(() => import("@presentation/pages/NotFoundPage"))
const ForgotPasswordPage = lazy(() => import("@presentation/pages/ForgotPasswordPage"))
const ResetPasswordPage = lazy(() => import("@presentation/pages/ResetPasswordPage"))

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
          <Route path="/forgot-password"     element={<ForgotPasswordPage />} />
          <Route path="/reset-password"      element={<ResetPasswordPage />} />

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