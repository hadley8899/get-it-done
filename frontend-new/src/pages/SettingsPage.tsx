import { Button, Stack } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/PageHeader'
import { SectionCard } from '@/components/SectionCard'

export function SettingsPage() {
  const navigate = useNavigate()

  return (
    <Stack spacing={3}>
      <PageHeader eyebrow="Settings" title="Settings" description="Manage your account and preferences." />
      <SectionCard title="User" description="Update profile details and change your password.">
        <Button variant="contained" onClick={() => navigate('/settings/user')}>
          Open user settings
        </Button>
      </SectionCard>
    </Stack>
  )
}
