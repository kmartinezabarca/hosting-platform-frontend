import React, { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import './App.css'
import ProtectedRoute from '@presentation/components/features/ProtectedRoute'
import ErrorBoundary from '@presentation/components/features/ErrorBoundary'

const AdminLayout         = lazy(() => import('@presentation/components/features/AdminLayout'))
const LoginPage           = lazy(() => import('@presentation/pages/LoginPage'))
const NotFoundPage        = lazy(() => import('@presentation/pages/NotFoundPage'))
const QuotationPublicPage = lazy(() => import('@presentation/pages/QuotationPublicPage'))

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
  </div>
)

export default function AppAdmin() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Admin tiene su propio login */}
          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/admin/*"
            element={
              <ProtectedRoute requireAdmin>
                <AdminLayout />
              </ProtectedRoute>
            }
          />

          {/* Public quotation page — no auth required */}
          <Route path="/cotizacion/:token" element={<QuotationPublicPage />} />

          <Route path="/"  element={<LoginPage />} />
          <Route path="*"  element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  )
}