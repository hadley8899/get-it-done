import { useState } from 'react'
import { Alert, Box, Button, Link, Stack, TextField } from '@mui/material'
import { useForm } from 'react-hook-form'
import { Link as RouterLink } from 'react-router-dom'
import { FormActions } from '@/components/FormActions'
import { FormCard } from '@/components/FormCard'
import { requestPasswordReset } from '@/services/authService'

type ForgotPasswordFormValues = {
  email: string
}

export function ForgotPasswordPage() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    defaultValues: { email: '' },
  })

  return (
    <Box sx={{ minHeight: 'calc(100vh - 160px)', display: 'grid', placeItems: 'center', py: 6 }}>
      <FormCard
        title="Forgot password"
        description="Enter your email address and we will send you a password reset link."
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
        <Stack
          component="form"
          spacing={2.5}
          onSubmit={handleSubmit(async (values) => {
            setErrorMessage(null)
            setSuccessMessage(null)

            try {
              await requestPasswordReset(values.email)
              setSuccessMessage('If an account exists for that email, a reset link has been sent.')
            } catch (error) {
              setErrorMessage(error instanceof Error ? error.message : 'Could not send password reset email.')
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
          <Button type="submit" variant="contained" size="large" disabled={isSubmitting}>
            {isSubmitting ? 'Sending reset link...' : 'Send reset link'}
          </Button>
        </Stack>
      </FormCard>
    </Box>
  )
}
