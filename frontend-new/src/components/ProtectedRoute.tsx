import { CircularProgress, Stack } from '@mui/material'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/auth/AuthContext'

export function ProtectedRoute() {
  const auth = useAuth()
  const location = useLocation()

  if (auth.isInitializing) {
    return (
      <Stack sx={{ minHeight: '50vh', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Stack>
    )
  }

  if (!auth.isAuthenticated) {
    const returnUrl = `${location.pathname}${location.search}${location.hash}`
    return <Navigate to={`/login?returnUrl=${encodeURIComponent(returnUrl)}`} replace />
  }

  return <Outlet />
}
