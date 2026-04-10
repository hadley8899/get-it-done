import { useEffect, useState } from 'react'
import { Alert, Box, Button, Link, Stack, TextField } from '@mui/material'
import { useForm } from 'react-hook-form'
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom'
import { FormActions } from '@/components/FormActions'
import { FormCard } from '@/components/FormCard'
import { resetForgottenPassword, validatePasswordResetToken } from '@/services/authService'

type ResetPasswordFormValues = {
  email: string
  password: string
  passwordConfirmation: string
}

export function ForgotPasswordConfirmPage() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [tokenChecking, setTokenChecking] = useState(true)
  const [tokenValid, setTokenValid] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    defaultValues: { email: '', password: '', passwordConfirmation: '' },
  })

  useEffect(() => {
    async function checkToken() {
      if (!token) {
        setErrorMessage('Reset token is missing.')
        setTokenChecking(false)
        return
      }

      setErrorMessage(null)

      try {
        await validatePasswordResetToken(token)
        setTokenValid(true)
      } catch (error) {
        setTokenValid(false)
        setErrorMessage(error instanceof Error ? error.message : 'Reset link is invalid or expired.')
      } finally {
        setTokenChecking(false)
      }
    }

    void checkToken()
  }, [token])

  return (
    <Box sx={{ minHeight: 'calc(100vh - 160px)', display: 'grid', placeItems: 'center', py: 6 }}>
      <FormCard
        title="Reset password"
        description="Enter your account email and choose a new password."
        footer={
          <FormActions>
            <Link component={RouterLink} to="/login" underline="hover">
              Back to sign in
            </Link>
          </FormActions>
        }
      >
        {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}
        {successMessage ? <Alert severity="success">{successMessage}</Alert> : null}

        {tokenChecking ? <Alert severity="info">Validating reset link...</Alert> : null}

        {!tokenChecking && tokenValid ? (
          <Stack
            component="form"
            spacing={2.5}
            onSubmit={handleSubmit(async (values) => {
              if (!token) {
                setErrorMessage('Reset token is missing.')
                return
              }

              setErrorMessage(null)
              setSuccessMessage(null)

              try {
                await resetForgottenPassword(values.email, token, values.password, values.passwordConfirmation)
                setSuccessMessage('Password reset successfully. Redirecting to sign in...')
                setTimeout(() => {
                  navigate('/login', { replace: true })
                }, 900)
              } catch (error) {
                setErrorMessage(error instanceof Error ? error.message : 'Password reset failed.')
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
              label="New password"
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
              label="Confirm new password"
              type="password"
              autoComplete="new-password"
              error={Boolean(errors.passwordConfirmation)}
              helperText={errors.passwordConfirmation?.message}
              {...register('passwordConfirmation', {
                required: 'Please confirm your password',
                validate: (value, formValues) => value === formValues.password || 'Passwords do not match',
              })}
            />
            <Button type="submit" variant="contained" size="large" disabled={isSubmitting}>
              {isSubmitting ? 'Resetting password...' : 'Reset password'}
            </Button>
          </Stack>
        ) : null}
      </FormCard>
    </Box>
  )
}
