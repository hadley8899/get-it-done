import { useState } from 'react'
import { Alert, Box, Button, Link, Stack, TextField } from '@mui/material'
import { useForm } from 'react-hook-form'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/auth/AuthContext'
import { FormActions } from '@/components/FormActions'
import { FormCard } from '@/components/FormCard'

type RegisterFormValues = {
  name: string
  email: string
  password: string
  confirmPassword: string
}

export function RegisterPage() {
  const auth = useAuth()
  const navigate = useNavigate()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  })

  return (
    <Box sx={{ minHeight: 'calc(100vh - 160px)', display: 'grid', placeItems: 'center', py: 6 }}>
      <FormCard
        title="Create account"
        description="Create your account to start using Get It Done."
        footer={
          <FormActions>
            <Link component={RouterLink} to="/login" underline="hover">
              Back to sign in
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
              await auth.register(values.name, values.email, values.password, values.confirmPassword)
              navigate('/dashboard', { replace: true })
            } catch (error) {
              setErrorMessage(error instanceof Error ? error.message : 'Registration failed.')
            }
          })}
        >
          <TextField
            label="Name"
            autoComplete="name"
            error={Boolean(errors.name)}
            helperText={errors.name?.message}
            {...register('name', {
              required: 'Name is required',
              minLength: { value: 2, message: 'Name must be at least 2 characters' },
            })}
          />
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
            autoComplete="new-password"
            error={Boolean(errors.password)}
            helperText={errors.password?.message}
            {...register('password', {
              required: 'Password is required',
              minLength: { value: 7, message: 'Password must be at least 7 characters' },
            })}
          />
          <TextField
            label="Confirm password"
            type="password"
            autoComplete="new-password"
            error={Boolean(errors.confirmPassword)}
            helperText={errors.confirmPassword?.message}
            {...register('confirmPassword', {
              required: 'Please confirm your password',
              validate: (value, formValues) => value === formValues.password || 'Passwords do not match',
            })}
          />
          <Button type="submit" variant="contained" size="large" disabled={isSubmitting}>
            {isSubmitting ? 'Creating account...' : 'Create account'}
          </Button>
        </Stack>
      </FormCard>
    </Box>
  )
}
