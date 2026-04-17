import { Button, Grid, Stack } from '@mui/material'
import { useEffect, useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { EmptyState } from '@/components/EmptyState'
import { KnowledgebaseCategoryCard } from '@/components/knowledgebase/KnowledgebaseCategoryCard'
import { PageHeader } from '@/components/PageHeader'
import { SectionCard } from '@/components/SectionCard'
import { useActiveWorkspace } from '@/hooks/useActiveWorkspace'
import { notifyError, notifySuccess } from '@/services/toastService'
import { deleteKnowledgebaseCategory, fetchKnowledgebaseCategories } from '@/services/knowledgebaseService'
import type { KnowledgebaseCategory } from '@/types/knowledgebase'

export function KnowledgebasePage() {
  const activeWorkspace = useActiveWorkspace()
  const [categories, setCategories] = useState<KnowledgebaseCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [categoryToDelete, setCategoryToDelete] = useState<KnowledgebaseCategory | null>(null)
  const [deletingCategoryUuid, setDeletingCategoryUuid] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function loadCategories() {
      setLoading(true)

      if (!activeWorkspace?.uuid) {
        setCategories([])
        setLoading(false)
        return
      }

      try {
        const nextCategories = await fetchKnowledgebaseCategories(activeWorkspace.uuid)
        if (isMounted) {
          setCategories(nextCategories)
        }
      } catch {
        notifyError('Failed to load knowledgebase categories.')
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    void loadCategories()

    return () => {
      isMounted = false
    }
  }, [activeWorkspace?.uuid])

  return (
    <Stack spacing={3}>
      <PageHeader
        eyebrow="Knowledgebase"
        title="Knowledgebase Categories"
        description={activeWorkspace?.name ? `Workspace: ${activeWorkspace.name}` : 'Select a workspace to manage knowledgebase categories.'}
        actions={
          <Button component={RouterLink} to="/knowledgebase/category/create" variant="contained" size="small" disabled={!activeWorkspace?.uuid}>
            Add category
          </Button>
        }
      />

      <SectionCard title="Categories" description="Open a category to manage children, knowledgebases, and items.">
        {!activeWorkspace?.uuid ? (
          <EmptyState
            title="No active workspace"
            description="Select a workspace from the top bar before using the knowledgebase."
          />
        ) : loading ? (
          <EmptyState title="Loading categories" description="Fetching knowledgebase categories from the Laravel API." />
        ) : categories.length === 0 ? (
          <EmptyState
            title="No categories yet"
            description="Create the first knowledgebase category for this workspace."
          />
        ) : (
          <Grid container spacing={2}>
            {categories.map((category) => (
              <Grid key={category.uuid} size={{ xs: 12, md: 6, lg: 4 }}>
                <KnowledgebaseCategoryCard
                  category={category}
                  isDeleting={deletingCategoryUuid === category.uuid}
                  onDelete={setCategoryToDelete}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </SectionCard>

      <ConfirmDialog
        open={categoryToDelete !== null}
        title="Delete category?"
        description={
          categoryToDelete
            ? `This will delete "${categoryToDelete.name}" and its nested knowledgebase structure.`
            : ''
        }
        confirmLabel="Delete category"
        confirmColor="error"
        isLoading={categoryToDelete !== null && deletingCategoryUuid === categoryToDelete.uuid}
        onClose={() => {
          if (!deletingCategoryUuid) {
            setCategoryToDelete(null)
          }
        }}
        onConfirm={() => {
          if (!categoryToDelete || !activeWorkspace?.uuid) {
            return
          }

          setDeletingCategoryUuid(categoryToDelete.uuid)
          void deleteKnowledgebaseCategory(activeWorkspace.uuid, categoryToDelete.uuid)
            .then(() => {
              setCategories((current) => current.filter((entry) => entry.uuid !== categoryToDelete.uuid))
              notifySuccess('Category deleted successfully.')
              setCategoryToDelete(null)
            })
            .catch(() => {
              notifyError('Failed to delete category.')
            })
            .finally(() => {
              setDeletingCategoryUuid(null)
            })
        }}
      />
    </Stack>
  )
}
