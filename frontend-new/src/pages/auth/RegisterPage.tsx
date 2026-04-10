import { Stack } from '@mui/material'
import { EmptyState } from '@/components/EmptyState'
import { PageHeader } from '@/components/PageHeader'

export function RegisterPage() {
  return (
    <Stack spacing={3}>
      <PageHeader eyebrow="Auth" title="Register" description="Registration parity is intentionally deferred and will be completed later." />
      <EmptyState title="Register route ready" description="This route exists in the preferred project structure and can be wired when auth parity work resumes." />
    </Stack>
  )
}
