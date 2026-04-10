import { useState } from 'react'
import { Alert, Box, Button, Link, Stack, TextField } from '@mui/material'
import { useForm } from 'react-hook-form'
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/auth/AuthContext'
import { FormActions } from '@/components/FormActions'
import { FormCard } from '@/components/FormCard'

type LoginFormValues = {
  email: string
  password: string
}

export function LoginPage() {
  const auth = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const searchParams = new URLSearchParams(location.search)
  const returnUrl = searchParams.get('returnUrl') || '/dashboard'
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    defaultValues: { email: '', password: '' },
  })

  return (
    <Box sx={{ minHeight: 'calc(100vh - 160px)', display: 'grid', placeItems: 'center', py: 6 }}>
      <FormCard
        title="Sign in"
        description="Use your existing Laravel account to access the React migration app."
        footer={
          <FormActions>
            <Link component={RouterLink} to="/user/register" underline="hover">
              Create account
            </Link>
            <Link component={RouterLink} to="/user/forgot-password" underline="hover">
              Forgot password
            </Link>
          </FormActions>
        }
      >
        {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}
        <Stack
          component="form"
          spacing={2.5}
          onSubmit={handleSubmit(async (values) => {
            setErrorMessage(null)
            try {
              await auth.login(values.email, values.password)
              navigate(returnUrl, { replace: true })
            } catch (error) {
              setErrorMessage(error instanceof Error ? error.message : 'Login failed.')
            }
          })}
        >
          <TextField
            label="Email"
            type="email"
            autoComplete="email"
            error={Boolean(errors.email)}
            helperText={errors.email?.message}
            {...register('email', { required: 'Email is required' })}
          />
          <TextField
            label="Password"
            type="password"
            autoComplete="current-password"
            error={Boolean(errors.password)}
            helperText={errors.password?.message}
            {...register('password', { required: 'Password is required' })}
          />
          <Button type="submit" variant="contained" size="large" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </Button>
        </Stack>
      </FormCard>
    </Box>
  )
}
