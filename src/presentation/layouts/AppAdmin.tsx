import React, { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import '@presentation/styles/App.css'
import ProtectedRoute from '@presentation/components/features/ProtectedRoute'
import ErrorBoundary from '@presentation/components/features/ErrorBoundary'

const AdminLayout         = lazy(() => import('@presentation/components/features/AdminLayout'))
const AdminLoginPage      = lazy(() => import('@presentation/pages/auth/AdminLoginPage'))
const NotFoundPage        = lazy(() => import('@presentation/pages/NotFoundPage'))
const QuotationPublicPage = lazy(() => import('@presentation/pages/QuotationPublicPage'))

// El bundle de AppAdmin se descarga muy rápido — sin fallback visual
// para evitar el efecto de 3 skeletons en secuencia.
// El skeleton real lo maneja ProtectedRoute (auth check) y AdminLayout (navegación entre páginas).
const PageLoader = () => null

export default function AppAdmin() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Admin tiene su propio login */}
          <Route path="/login" element={<AdminLoginPage />} />

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

          <Route path="/"  element={<AdminLoginPage/>} />
          <Route path="*"  element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  )
}