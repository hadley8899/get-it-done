import { Stack } from '@mui/material'
import { EmptyState } from '@/components/EmptyState'
import { PageHeader } from '@/components/PageHeader'

export function ForgotPasswordPage() {
  return (
    <Stack spacing={3}>
      <PageHeader eyebrow="Auth" title="Forgot password" description="Password reset parity is intentionally deferred and will be completed later." />
      <EmptyState title="Forgot password route ready" description="This route exists in the preferred project structure and can be wired when auth parity work resumes." />
    </Stack>
  )
}
