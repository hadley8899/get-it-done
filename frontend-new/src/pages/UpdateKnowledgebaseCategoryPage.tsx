import { Stack } from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { EmptyState } from '@/components/EmptyState'
import { FormCard } from '@/components/FormCard'
import { PageHeader } from '@/components/PageHeader'
import { KnowledgebaseCategoryForm } from '@/components/knowledgebase/KnowledgebaseCategoryForm'
import { notifyError, notifySuccess } from '@/services/toastService'
import { fetchKnowledgebaseCategory, updateKnowledgebaseCategory } from '@/services/knowledgebaseService'
import { getStoredActiveWorkspace } from '@/services/workspaceService'
import type { KnowledgebaseCategory } from '@/types/knowledgebase'

export function UpdateKnowledgebaseCategoryPage() {
  const { uuid = '' } = useParams()
  const navigate = useNavigate()
  const activeWorkspace = useMemo(() => getStoredActiveWorkspace(), [])
  const [category, setCategory] = useState<KnowledgebaseCategory | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let isMounted = true

    async function loadCategory() {
      if (!activeWorkspace?.uuid || !uuid) {
        setLoading(false)
        return
      }

      try {
        const nextCategory = await fetchKnowledgebaseCategory(activeWorkspace.uuid, uuid)
        if (isMounted) {
          setCategory(nextCategory)
        }
      } catch {
        notifyError('Failed to load category.')
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    void loadCategory()

    return () => {
      isMounted = false
    }
  }, [activeWorkspace?.uuid, uuid])

  if (!activeWorkspace?.uuid) {
    return (
      <EmptyState
        title="No active workspace"
        description="Select a workspace from the sidebar before updating a knowledgebase category."
        actionLabel="Go to workspaces"
        onAction={() => navigate('/workspaces')}
      />
    )
  }

  if (loading) {
    return <EmptyState title="Loading category" description="Fetching category details from the Laravel API." />
  }

  if (!category) {
    return <EmptyState title="Category not found" description="The requested category could not be loaded." />
  }

  return (
    <Stack spacing={3}>
      <PageHeader eyebrow="Knowledgebase" title={`Update ${category.name}`} description="Edit the knowledgebase category fields." />
      <FormCard title="Category details" description="Update the category name and description.">
        <KnowledgebaseCategoryForm
          defaultValues={{
            name: category.name,
            description: category.description ?? '',
          }}
          submitLabel="Save category"
          isSubmitting={saving}
          onSubmit={async (values) => {
            setSaving(true)
            try {
              await updateKnowledgebaseCategory(activeWorkspace.uuid, uuid, values)
              notifySuccess('Category updated successfully.')
              navigate(`/knowledgebase/category/${uuid}`)
            } catch {
              notifyError('Failed to update category.')
            } finally {
              setSaving(false)
            }
          }}
        />
      </FormCard>
    </Stack>
  )
}
