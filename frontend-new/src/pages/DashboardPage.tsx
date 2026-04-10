import { Button, Grid, Stack, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { useAuth } from '@/auth/AuthContext'
import { PageHeader } from '@/components/PageHeader'
import { SectionCard } from '@/components/SectionCard'
import { StatCard } from '@/components/StatCard'
import { StatusBanner } from '@/components/StatusBanner'
import { fetchWorkspaceInvites, fetchWorkspaces, getStoredActiveWorkspace } from '@/services/workspaceService'

export function DashboardPage() {
  const { user } = useAuth()
  const [workspaceCount, setWorkspaceCount] = useState(0)
  const [inviteCount, setInviteCount] = useState(0)
  const [activeWorkspaceName, setActiveWorkspaceName] = useState('None')

  useEffect(() => {
    let isMounted = true

    async function loadSummary() {
      const [workspaces, invites] = await Promise.all([fetchWorkspaces(), fetchWorkspaceInvites()])

      if (!isMounted) {
        return
      }

      setWorkspaceCount(workspaces.length)
      setInviteCount(invites.length)
      setActiveWorkspaceName(getStoredActiveWorkspace()?.name ?? 'None')
    }

    void loadSummary()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <Stack spacing={3}>
      <PageHeader
        eyebrow="Dashboard"
        title="Shared UI foundation"
        description="The React app now follows the flatter project structure and service-based data flow used in your other projects."
        actions={<Button variant="contained">Feature migration active</Button>}
      />
      {user ? (
        <StatusBanner severity="success" title="Auth bootstrap">
          Current user loaded successfully for <strong>{user.email}</strong>.
        </StatusBanner>
      ) : null}
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 4 }}>
          <StatCard label="Routes" value="11" caption="Current Angular route groups mapped into React Router." />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <StatCard label="Workspaces" value={String(workspaceCount)} caption="Live count from the Laravel workspace list endpoint." />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <StatCard label="Invites" value={String(inviteCount)} tone="secondary" caption="Pending workspace invites from the API." />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <StatCard label="Active workspace" value={activeWorkspaceName} tone="warning" caption="Persisted locally for cross-page use." />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <StatCard
            label="Permissions"
            value={user ? String(user.permissions.length) : '0'}
            tone="success"
            caption="Loaded from the existing backend user details endpoint."
          />
        </Grid>
      </Grid>
      <SectionCard
        title="Migration workspace"
        description="Dashboard and workspace routes are now using local state plus service calls instead of query library abstractions."
      >
        <Typography color="text.secondary">
          This app is now aligned with your preferred structure: `api`, `auth`, `components`, `pages`, `services`, and `types`.
        </Typography>
      </SectionCard>
    </Stack>
  )
}
