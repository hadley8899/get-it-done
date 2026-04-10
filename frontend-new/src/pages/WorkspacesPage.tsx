import { Button, Grid, Stack } from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { EmptyState } from '@/components/EmptyState'
import { PageHeader } from '@/components/PageHeader'
import { SectionCard } from '@/components/SectionCard'
import { StatCard } from '@/components/StatCard'
import { notifyError, notifySuccess } from '@/services/toastService'
import {
  deleteWorkspace,
  fetchWorkspaceInvites,
  fetchWorkspaces,
  getStoredActiveWorkspace,
  setStoredActiveWorkspace,
} from '@/services/workspaceService'
import type { Workspace } from '@/types/workspace'
import { WorkspaceCard } from '@/components/workspaces/WorkspaceCard'

export function WorkspacesPage() {
  const navigate = useNavigate()
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [inviteCount, setInviteCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [pendingDeleteUuid, setPendingDeleteUuid] = useState<string | null>(null)
  const [workspaceToDelete, setWorkspaceToDelete] = useState<Workspace | null>(null)
  const [activeWorkspaceUuid, setActiveWorkspaceUuid] = useState<string | null>(() => getStoredActiveWorkspace()?.uuid ?? null)

  const activeWorkspace = useMemo(
    () => workspaces.find((workspace) => workspace.uuid === activeWorkspaceUuid) ?? null,
    [activeWorkspaceUuid, workspaces],
  )

  useEffect(() => {
    let isMounted = true

    async function loadPage() {
      try {
        const [workspaceData, inviteData] = await Promise.all([fetchWorkspaces(), fetchWorkspaceInvites()])

        if (!isMounted) {
          return
        }

        setWorkspaces(workspaceData)
        setInviteCount(inviteData.length)

        const storedActive = getStoredActiveWorkspace()
        if (storedActive && workspaceData.some((workspace) => workspace.uuid === storedActive.uuid)) {
          setActiveWorkspaceUuid(storedActive.uuid)
        } else {
          setActiveWorkspaceUuid(null)
          setStoredActiveWorkspace(null)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    void loadPage()

    return () => {
      isMounted = false
    }
  }, [])

  const handleSelectWorkspace = (workspace: Workspace) => {
    setActiveWorkspaceUuid(workspace.uuid)
    setStoredActiveWorkspace(workspace)
    notifySuccess('Workspace selected successfully.')
  }

  const handleDeleteWorkspace = (workspace: Workspace) => {
    setWorkspaceToDelete(workspace)
  }

  return (
    <Stack spacing={3}>
      <PageHeader
        eyebrow="Workspaces"
        title="Workspace migration area"
        description="The workspace route group is now backed by real Laravel data, local active-workspace selection, and invite visibility."
        actions={
          <>
            <Button component={RouterLink} to="/workspaces/invites" variant="outlined">
              Invites ({inviteCount})
            </Button>
            <Button component={RouterLink} to="/workspaces/create" variant="contained">
              Add workspace
            </Button>
          </>
        }
      />

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 4 }}>
          <StatCard label="Workspaces" value={String(workspaces.length)} caption="Loaded from the current backend endpoint." />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <StatCard label="Active" value={activeWorkspace?.name ?? 'None'} tone="success" caption="Persisted in local storage for cross-page use." />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <StatCard label="Invites" value={String(inviteCount)} tone="secondary" caption="Pending workspace invites for the current user." />
        </Grid>
      </Grid>

      <SectionCard title="Your workspaces" description="Select an active workspace, edit its settings, or remove it.">
        {loading ? (
          <EmptyState title="Loading workspaces" description="Fetching the workspace list from the Laravel API." />
        ) : workspaces.length === 0 ? (
          <EmptyState
            title="No workspaces yet"
            description="Create your first workspace to start using the React migration flow."
            actionLabel="Create workspace"
            onAction={() => navigate('/workspaces/create')}
          />
        ) : (
          <Grid container spacing={2.5}>
            {workspaces.map((workspace) => (
              <Grid key={workspace.uuid} size={{ xs: 12, md: 6, lg: 4 }}>
                <WorkspaceCard
                  workspace={workspace}
                  isActive={workspace.uuid === activeWorkspaceUuid}
                  isDeleting={pendingDeleteUuid === workspace.uuid}
                  onSelect={handleSelectWorkspace}
                  onDelete={handleDeleteWorkspace}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </SectionCard>

      <ConfirmDialog
        open={workspaceToDelete !== null}
        title="Delete workspace?"
        description={
          workspaceToDelete
            ? `This will permanently delete "${workspaceToDelete.name}" and its related records.`
            : ''
        }
        confirmLabel="Delete workspace"
        confirmColor="error"
        isLoading={workspaceToDelete !== null && pendingDeleteUuid === workspaceToDelete.uuid}
        onClose={() => {
          if (!pendingDeleteUuid) {
            setWorkspaceToDelete(null)
          }
        }}
        onConfirm={() => {
          if (!workspaceToDelete) {
            return
          }

          setPendingDeleteUuid(workspaceToDelete.uuid)

          void deleteWorkspace(workspaceToDelete.uuid)
            .then(() => {
              const nextWorkspaces = workspaces.filter((item) => item.uuid !== workspaceToDelete.uuid)
              setWorkspaces(nextWorkspaces)

              if (activeWorkspaceUuid === workspaceToDelete.uuid) {
                setActiveWorkspaceUuid(null)
                setStoredActiveWorkspace(null)
              }

              notifySuccess('Workspace deleted successfully.')
              setWorkspaceToDelete(null)
            })
            .catch(() => {
              notifyError('Failed to delete the workspace.')
            })
            .finally(() => {
              setPendingDeleteUuid(null)
            })
        }}
      />
    </Stack>
  )
}
