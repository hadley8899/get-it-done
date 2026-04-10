import { Stack } from '@mui/material'
import { useParams } from 'react-router-dom'
import { EmptyState } from '@/components/EmptyState'
import { PageHeader } from '@/components/PageHeader'

export function ForgotPasswordConfirmPage() {
  const { token } = useParams()

  return (
    <Stack spacing={3}>
      <PageHeader eyebrow="Auth" title="Reset password" description="Password reset parity is intentionally deferred and will be completed later." />
      <EmptyState title="Reset route ready" description={`Reset token detected: ${token ?? 'missing'}.`} />
    </Stack>
  )
}
