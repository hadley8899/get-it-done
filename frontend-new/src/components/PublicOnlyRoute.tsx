import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/auth/AuthContext'

export function PublicOnlyRoute() {
  const auth = useAuth()

  if (auth.isInitializing) {
    return null
  }

  if (auth.isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
