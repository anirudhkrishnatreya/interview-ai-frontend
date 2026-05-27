import React from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import SuperAdminLayout from './pages/super-admin'
import CompanyAdminLayout from './pages/company-admin'
import CandidateLayout from './pages/candidate'
import LandingPage from './pages/LandingPage'

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: string[] }) {
  const location = useLocation()
  const { isAuthenticated, user } = useAuthStore()
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ redirectTo: `${location.pathname}${location.search}${location.hash}` }}
      />
    )
  }
  if (!allowedRoles.includes(user?.role || '')) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/super-admin/*" element={
        <ProtectedRoute allowedRoles={['super_admin']}>
          <SuperAdminLayout />
        </ProtectedRoute>
      } />
      <Route path="/company-admin/*" element={
        <ProtectedRoute allowedRoles={['company_admin']}>
          <CompanyAdminLayout />
        </ProtectedRoute>
      } />
      <Route path="/candidate/*" element={
        <ProtectedRoute allowedRoles={['candidate']}>
          <CandidateLayout />
        </ProtectedRoute>
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
