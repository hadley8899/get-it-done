import { Stack } from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BoardForm } from '@/components/boards/BoardForm'
import { EmptyState } from '@/components/EmptyState'
import { FormCard } from '@/components/FormCard'
import { PageHeader } from '@/components/PageHeader'
import { createBoard, fetchBoardTemplates } from '@/services/boardService'
import { notifyError, notifySuccess } from '@/services/toastService'
import { getStoredActiveWorkspace } from '@/services/workspaceService'
import type { BoardTemplate } from '@/types/board'

export function CreateBoardPage() {
  const navigate = useNavigate()
  const activeWorkspace = useMemo(() => getStoredActiveWorkspace(), [])
  const [templates, setTemplates] = useState<BoardTemplate[]>([])
  const [loadingTemplates, setLoadingTemplates] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let isMounted = true

    async function loadTemplates() {
      try {
        const templateData = await fetchBoardTemplates()

        if (isMounted) {
          setTemplates(templateData)
        }
      } catch {
        notifyError('Failed to load board templates.')
      } finally {
        if (isMounted) {
          setLoadingTemplates(false)
        }
      }
    }

    void loadTemplates()

    return () => {
      isMounted = false
    }
  }, [])

  if (!activeWorkspace?.uuid) {
    return (
      <EmptyState
        title="No active workspace"
        description="Select a workspace from the sidebar before creating a board."
        actionLabel="Go to workspaces"
        onAction={() => navigate('/workspaces')}
      />
    )
  }

  return (
    <Stack spacing={3}>
      <PageHeader
        eyebrow="Boards"
        title="Create board"
        description={`Create a new board inside ${activeWorkspace.name}.`}
      />
      <FormCard title="Board details" description="Optionally apply a board template during creation.">
        {loadingTemplates ? (
          <EmptyState title="Loading templates" description="Fetching board templates from the Laravel API." />
        ) : (
          <BoardForm
            templates={templates}
            isSubmitting={saving}
            onSubmit={async (values) => {
              setSaving(true)

              try {
                await createBoard(activeWorkspace.uuid, values)
                notifySuccess('Board created successfully.')
                navigate('/boards')
              } catch {
                notifyError('Failed to create the board.')
              } finally {
                setSaving(false)
              }
            }}
          />
        )}
      </FormCard>
    </Stack>
  )
}
