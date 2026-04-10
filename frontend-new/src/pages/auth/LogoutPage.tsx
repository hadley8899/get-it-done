import { CircularProgress, Stack, Typography } from '@mui/material'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/auth/AuthContext'

export function LogoutPage() {
  const auth = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    void auth.logout().finally(() => {
      navigate('/login', { replace: true })
    })
  }, [auth, navigate])

  return (
    <Stack spacing={2} sx={{ minHeight: '40vh', alignItems: 'center', justifyContent: 'center' }}>
      <CircularProgress />
      <Typography color="text.secondary">Signing you out...</Typography>
    </Stack>
  )
}
