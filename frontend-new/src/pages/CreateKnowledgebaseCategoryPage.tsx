import { Stack } from '@mui/material'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { EmptyState } from '@/components/EmptyState'
import { FormCard } from '@/components/FormCard'
import { PageHeader } from '@/components/PageHeader'
import { KnowledgebaseCategoryForm } from '@/components/knowledgebase/KnowledgebaseCategoryForm'
import { notifyError, notifySuccess } from '@/services/toastService'
import { createKnowledgebaseCategory } from '@/services/knowledgebaseService'
import { getStoredActiveWorkspace } from '@/services/workspaceService'

export function CreateKnowledgebaseCategoryPage() {
  const navigate = useNavigate()
  const activeWorkspace = useMemo(() => getStoredActiveWorkspace(), [])
  const [saving, setSaving] = useState(false)

  if (!activeWorkspace?.uuid) {
    return (
      <EmptyState
        title="No active workspace"
        description="Select a workspace from the sidebar before creating a knowledgebase category."
        actionLabel="Go to workspaces"
        onAction={() => navigate('/workspaces')}
      />
    )
  }

  return (
    <Stack spacing={3}>
      <PageHeader
        eyebrow="Knowledgebase"
        title="Create category"
        description={`Create a top-level knowledgebase category inside ${activeWorkspace.name}.`}
      />
      <FormCard title="Category details" description="Knowledgebase content is organized under categories first.">
        <KnowledgebaseCategoryForm
          submitLabel="Create category"
          isSubmitting={saving}
          onSubmit={async (values) => {
            setSaving(true)
            try {
              await createKnowledgebaseCategory(activeWorkspace.uuid, values)
              notifySuccess('Category created successfully.')
              navigate('/knowledgebase')
            } catch {
              notifyError('Failed to create category.')
            } finally {
              setSaving(false)
            }
          }}
        />
      </FormCard>
    </Stack>
  )
}
