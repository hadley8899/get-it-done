import { Button, Grid, Stack } from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { BoardCard } from '@/components/boards/BoardCard'
import { EmptyState } from '@/components/EmptyState'
import { PageHeader } from '@/components/PageHeader'
import { SectionCard } from '@/components/SectionCard'
import { StatCard } from '@/components/StatCard'
import { notifyError } from '@/services/toastService'
import { fetchBoards } from '@/services/boardService'
import { getStoredActiveWorkspace } from '@/services/workspaceService'
import type { Board } from '@/types/board'

export function BoardsPage() {
  const navigate = useNavigate()
  const [boards, setBoards] = useState<Board[]>([])
  const [loading, setLoading] = useState(true)
  const activeWorkspace = useMemo(() => getStoredActiveWorkspace(), [])

  useEffect(() => {
    let isMounted = true

    async function loadBoards() {
      if (!activeWorkspace?.uuid) {
        setLoading(false)
        return
      }

      try {
        const boardData = await fetchBoards(activeWorkspace.uuid)

        if (isMounted) {
          setBoards(boardData)
        }
      } catch {
        notifyError('Failed to load boards.')
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    void loadBoards()

    return () => {
      isMounted = false
    }
  }, [activeWorkspace?.uuid])

  return (
    <Stack spacing={3}>
      <PageHeader
        eyebrow="Boards"
        title="Boards"
        description="Boards now load from the active workspace using the current Laravel endpoints."
        actions={
          <>
            <Button component={RouterLink} to="/boards/board-templates" variant="outlined">
              Board templates
            </Button>
            <Button component={RouterLink} to="/boards/create" variant="contained" disabled={!activeWorkspace?.uuid}>
              Create board
            </Button>
          </>
        }
      />

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 6 }}>
          <StatCard
            label="Active workspace"
            value={activeWorkspace?.name ?? 'None'}
            tone="success"
            caption="Boards are scoped to the currently selected workspace."
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <StatCard
            label="Boards"
            value={String(boards.length)}
            caption="Loaded from the existing boards endpoint for the active workspace."
          />
        </Grid>
      </Grid>

      <SectionCard title="Workspace boards" description="Open an existing board or create a new one for the active workspace.">
        {!activeWorkspace?.uuid ? (
          <EmptyState
            title="No active workspace"
            description="Select a workspace from the sidebar before working with boards."
            actionLabel="Go to workspaces"
            onAction={() => navigate('/workspaces')}
          />
        ) : loading ? (
          <EmptyState title="Loading boards" description="Fetching boards from the Laravel API." />
        ) : boards.length === 0 ? (
          <EmptyState
            title="No boards yet"
            description="Create the first board for this workspace to start building lists and tasks."
            actionLabel="Create board"
            onAction={() => navigate('/boards/create')}
          />
        ) : (
          <Grid container spacing={2.5}>
            {boards.map((board) => (
              <Grid key={board.uuid} size={{ xs: 12, md: 6, lg: 4 }}>
                <BoardCard board={board} />
              </Grid>
            ))}
          </Grid>
        )}
      </SectionCard>
    </Stack>
  )
}
