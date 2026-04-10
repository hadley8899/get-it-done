import {
  Button,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { EmptyState } from '@/components/EmptyState'
import { PageHeader } from '@/components/PageHeader'
import { SectionCard } from '@/components/SectionCard'
import { KnowledgebaseCategoryForm } from '@/components/knowledgebase/KnowledgebaseCategoryForm'
import { KnowledgebaseDialog } from '@/components/knowledgebase/KnowledgebaseDialog'
import { KnowledgebaseItemsTable } from '@/components/knowledgebase/KnowledgebaseItemsTable'
import { KnowledgebaseItemDialog } from '@/components/knowledgebase/KnowledgebaseItemDialog'
import { notifyError, notifySuccess } from '@/services/toastService'
import {
  createKnowledgebaseCategory,
  createKnowledgebase,
  createKnowledgebaseItem,
  updateKnowledgebaseCategory,
  deleteKnowledgebase,
  deleteKnowledgebaseItem,
  fetchKnowledgebaseCategory,
  fetchKnowledgebaseChildCategories,
  fetchKnowledgebaseItems,
  fetchKnowledgebases,
  updateKnowledgebase,
  updateKnowledgebaseItem,
} from '@/services/knowledgebaseService'
import { getStoredActiveWorkspace } from '@/services/workspaceService'
import type { Knowledgebase, KnowledgebaseCategory, KnowledgebaseItem } from '@/types/knowledgebase'

export function KnowledgebaseCategoryPage() {
  const { uuid = '' } = useParams()
  const navigate = useNavigate()
  const activeWorkspace = useMemo(() => getStoredActiveWorkspace(), [])
  const [category, setCategory] = useState<KnowledgebaseCategory | null>(null)
  const [childCategories, setChildCategories] = useState<KnowledgebaseCategory[]>([])
  const [knowledgebases, setKnowledgebases] = useState<Knowledgebase[]>([])
  const [activeKnowledgebaseUuid, setActiveKnowledgebaseUuid] = useState<string | null>(null)
  const [knowledgebaseItems, setKnowledgebaseItems] = useState<KnowledgebaseItem[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingItems, setLoadingItems] = useState(false)
  const [knowledgebaseDialogOpen, setKnowledgebaseDialogOpen] = useState(false)
  const [editingKnowledgebase, setEditingKnowledgebase] = useState<Knowledgebase | null>(null)
  const [savingKnowledgebase, setSavingKnowledgebase] = useState(false)
  const [categoryDialogMode, setCategoryDialogMode] = useState<'create-child' | 'update' | null>(null)
  const [savingCategory, setSavingCategory] = useState(false)
  const [itemDialogOpen, setItemDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<KnowledgebaseItem | null>(null)
  const [savingItem, setSavingItem] = useState(false)
  const [knowledgebaseToDelete, setKnowledgebaseToDelete] = useState<Knowledgebase | null>(null)
  const [itemToDelete, setItemToDelete] = useState<KnowledgebaseItem | null>(null)
  const [deletingKnowledgebaseUuid, setDeletingKnowledgebaseUuid] = useState<string | null>(null)
  const [deletingItemUuid, setDeletingItemUuid] = useState<string | null>(null)
  const [knowledgebaseSearch, setKnowledgebaseSearch] = useState('')

  const activeKnowledgebase = useMemo(
    () => knowledgebases.find((entry) => entry.uuid === activeKnowledgebaseUuid) ?? null,
    [activeKnowledgebaseUuid, knowledgebases],
  )

  const filteredKnowledgebaseItems = useMemo(() => {
    const searchTerm = knowledgebaseSearch.trim().toLowerCase()

    if (!searchTerm) {
      return knowledgebaseItems
    }

    return knowledgebaseItems.filter((item) =>
      `${item.name} ${item.contents}`.toLowerCase().includes(searchTerm),
    )
  }, [knowledgebaseItems, knowledgebaseSearch])

  const loadItems = useCallback(async (knowledgebaseUuid: string) => {
    if (!activeWorkspace?.uuid || !uuid) {
      return
    }

    setLoadingItems(true)
    try {
      const items = await fetchKnowledgebaseItems(activeWorkspace.uuid, uuid, knowledgebaseUuid)
      setKnowledgebaseItems(items)
    } catch {
      notifyError('Failed to load knowledgebase items.')
    } finally {
      setLoadingItems(false)
    }
  }, [activeWorkspace?.uuid, uuid])

  const loadPage = useCallback(async () => {
    if (!activeWorkspace?.uuid || !uuid) {
      setLoading(false)
      return
    }

    try {
      const [nextCategory, nextChildCategories, nextKnowledgebases] = await Promise.all([
        fetchKnowledgebaseCategory(activeWorkspace.uuid, uuid),
        fetchKnowledgebaseChildCategories(activeWorkspace.uuid, uuid),
        fetchKnowledgebases(activeWorkspace.uuid, uuid),
      ])

      setCategory(nextCategory)
      setChildCategories(nextChildCategories)
      setKnowledgebases(nextKnowledgebases)

      const nextActiveKnowledgebaseUuid = nextKnowledgebases[0]?.uuid ?? null
      setActiveKnowledgebaseUuid(nextActiveKnowledgebaseUuid)

      if (nextActiveKnowledgebaseUuid) {
        await loadItems(nextActiveKnowledgebaseUuid)
      } else {
        setKnowledgebaseItems([])
      }
    } catch {
      notifyError('Failed to load knowledgebase category.')
    } finally {
      setLoading(false)
    }
  }, [activeWorkspace?.uuid, loadItems, uuid])

  useEffect(() => {
    void loadPage()
  }, [loadPage])

  if (!activeWorkspace?.uuid) {
    return (
      <EmptyState
        title="No active workspace"
        description="Select a workspace from the sidebar before opening the knowledgebase."
        actionLabel="Go to workspaces"
        onAction={() => navigate('/workspaces')}
      />
    )
  }

  if (loading) {
    return <EmptyState title="Loading category" description="Fetching category, knowledgebases, and items from the Laravel API." />
  }

  if (!category) {
    return <EmptyState title="Category not found" description="The requested knowledgebase category could not be loaded." />
  }

  return (
    <Stack spacing={3}>
      <PageHeader
        eyebrow="Knowledgebase"
        title={category.name}
        description={category.description || 'No description'}
        actions={
          <>
            <Button component={RouterLink} to="/knowledgebase" variant="outlined">
              Back to categories
            </Button>
            <Button variant="contained" size="small" onClick={() => setCategoryDialogMode('update')}>
              Update category
            </Button>
          </>
        }
      />

      <SectionCard title="Children">
        <Stack spacing={1.25}>
          <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
            {category.parent ? (
              <Chip
                label="Back"
                component={RouterLink}
                to={`/knowledgebase/category/${category.parent.uuid}`}
                clickable
                variant="outlined"
              />
            ) : (
              <Chip
                label="Back"
                component={RouterLink}
                to="/knowledgebase"
                clickable
                variant="outlined"
              />
            )}
            {childCategories.map((childCategory) => (
              <Chip
                key={childCategory.uuid}
                label={childCategory.name}
                component={RouterLink}
                to={`/knowledgebase/category/${childCategory.uuid}`}
                clickable
                variant="outlined"
              />
            ))}
            <Chip
              label="New"
              clickable
              variant="outlined"
              onClick={() => setCategoryDialogMode('create-child')}
            />
          </Stack>
          {childCategories.length === 0 ? (
            <EmptyState
              title="No child categories"
              description="This category does not contain any child categories yet."
              compact
            />
          ) : null}
        </Stack>
      </SectionCard>

      <SectionCard
        title="Knowledgebases"
        actions={
          activeKnowledgebase ? (
            <Button
              variant="contained"
              size="small"
              onClick={() => {
                setEditingKnowledgebase(activeKnowledgebase)
                setKnowledgebaseDialogOpen(true)
              }}
            >
              Edit
            </Button>
          ) : null
        }
      >
        {knowledgebases.length === 0 ? (
          <EmptyState
            title="No knowledgebases yet"
            description="Create the first knowledgebase inside this category."
            compact
          />
        ) : (
          <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
            {knowledgebases.map((knowledgebase) => (
              <Chip
                key={knowledgebase.uuid}
                label={`${knowledgebase.name} (${knowledgebase.item_count})`}
                color={knowledgebase.uuid === activeKnowledgebaseUuid ? 'default' : 'primary'}
                variant={knowledgebase.uuid === activeKnowledgebaseUuid ? 'filled' : 'outlined'}
                clickable
                onClick={() => {
                  setActiveKnowledgebaseUuid(knowledgebase.uuid)
                  void loadItems(knowledgebase.uuid)
                }}
              />
            ))}
            <Chip
              label="New"
              clickable
              variant="outlined"
              onClick={() => {
                setEditingKnowledgebase(null)
                setKnowledgebaseDialogOpen(true)
              }}
            />
          </Stack>
        )}
      </SectionCard>

      {activeKnowledgebase ? (
        <SectionCard
          title="Knowledgebase Items"
          description={activeKnowledgebase.description || undefined}
          actions={
            <Stack direction="row" spacing={1.25} useFlexGap sx={{ flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="small"
                onClick={() => {
                  setEditingItem(null)
                  setItemDialogOpen(true)
                }}
              >
                New item
              </Button>
              <Button color="error" onClick={() => setKnowledgebaseToDelete(activeKnowledgebase)}>
                Delete knowledgebase
              </Button>
            </Stack>
          }
        >
          {loadingItems ? (
            <EmptyState title="Loading items" description="Fetching knowledgebase items from the Laravel API." />
          ) : knowledgebaseItems.length === 0 ? (
            <EmptyState title="No items yet" description="Add the first item for this knowledgebase." />
          ) : (
            <Stack spacing={2}>
              <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' } }} spacing={1.5}>
                <Typography variant="body2" color="text.secondary">
                  Showing {filteredKnowledgebaseItems.length} of {knowledgebaseItems.length} entries
                </Typography>
                <TextField
                  label="Search"
                  size="small"
                  value={knowledgebaseSearch}
                  onChange={(event) => setKnowledgebaseSearch(event.target.value)}
                  sx={{ minWidth: { sm: 240 } }}
                />
              </Stack>
              <KnowledgebaseItemsTable
                items={filteredKnowledgebaseItems}
                onSelect={(item) => {
                  setEditingItem(item)
                  setItemDialogOpen(true)
                }}
              />
            </Stack>
          )}
        </SectionCard>
      ) : null}

      <KnowledgebaseDialog
        open={knowledgebaseDialogOpen}
        title={editingKnowledgebase ? 'Update knowledgebase' : 'New knowledgebase'}
        knowledgebase={editingKnowledgebase}
        isSaving={savingKnowledgebase}
        onClose={() => {
          if (!savingKnowledgebase) {
            setKnowledgebaseDialogOpen(false)
            setEditingKnowledgebase(null)
          }
        }}
        onSubmit={async (values) => {
          setSavingKnowledgebase(true)
          try {
            if (editingKnowledgebase) {
              const updatedKnowledgebase = await updateKnowledgebase(
                activeWorkspace.uuid,
                category.uuid,
                editingKnowledgebase.uuid,
                values,
              )
              setKnowledgebases((current) =>
                current.map((entry) => (entry.uuid === updatedKnowledgebase.uuid ? updatedKnowledgebase : entry)),
              )
              notifySuccess('Knowledgebase updated successfully.')
            } else {
              const createdKnowledgebase = await createKnowledgebase(activeWorkspace.uuid, category.uuid, values)
              setKnowledgebases((current) => [...current, createdKnowledgebase])
              setActiveKnowledgebaseUuid(createdKnowledgebase.uuid)
              await loadItems(createdKnowledgebase.uuid)
              notifySuccess('Knowledgebase created successfully.')
            }
            setKnowledgebaseDialogOpen(false)
            setEditingKnowledgebase(null)
          } catch {
            notifyError(editingKnowledgebase ? 'Failed to update knowledgebase.' : 'Failed to create knowledgebase.')
          } finally {
            setSavingKnowledgebase(false)
          }
        }}
      />

      <KnowledgebaseItemDialog
        open={itemDialogOpen}
        title={editingItem ? 'Update knowledgebase item' : 'New knowledgebase item'}
        item={editingItem}
        isSaving={savingItem}
        isDeleting={itemToDelete !== null && deletingItemUuid === itemToDelete.uuid}
        onClose={() => {
          if (!savingItem) {
            setItemDialogOpen(false)
            setEditingItem(null)
          }
        }}
        onDelete={(item) => {
          setItemDialogOpen(false)
          setEditingItem(null)
          setItemToDelete(item)
        }}
        onSubmit={async (values) => {
          if (!activeKnowledgebase) {
            return
          }

          setSavingItem(true)
          try {
            if (editingItem) {
              const updatedItem = await updateKnowledgebaseItem(
                activeWorkspace.uuid,
                category.uuid,
                activeKnowledgebase.uuid,
                editingItem.uuid,
                values,
              )
              setKnowledgebaseItems((current) =>
                current.map((entry) => (entry.uuid === updatedItem.uuid ? updatedItem : entry)),
              )
              notifySuccess('Knowledgebase item updated successfully.')
            } else {
              const createdItem = await createKnowledgebaseItem(
                activeWorkspace.uuid,
                category.uuid,
                activeKnowledgebase.uuid,
                values,
              )
              setKnowledgebaseItems((current) => [...current, createdItem])
              setKnowledgebases((current) =>
                current.map((entry) =>
                  entry.uuid === activeKnowledgebase.uuid
                    ? { ...entry, item_count: entry.item_count + 1 }
                    : entry,
                ),
              )
              notifySuccess('Knowledgebase item created successfully.')
            }
            setItemDialogOpen(false)
            setEditingItem(null)
          } catch {
            notifyError(editingItem ? 'Failed to update item.' : 'Failed to create item.')
          } finally {
            setSavingItem(false)
          }
        }}
      />

      <Dialog
        open={categoryDialogMode !== null}
        onClose={() => {
          if (!savingCategory) {
            setCategoryDialogMode(null)
          }
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {categoryDialogMode === 'update' ? 'Update knowledgebase category' : 'New knowledgebase category child'}
        </DialogTitle>
        <DialogContent>
          <Stack sx={{ pt: 1 }}>
            <KnowledgebaseCategoryForm
              defaultValues={{
                name: categoryDialogMode === 'update' ? category.name : '',
                description: categoryDialogMode === 'update' ? category.description : '',
              }}
              submitLabel={categoryDialogMode === 'update' ? 'Update category' : 'Create child category'}
              isSubmitting={savingCategory}
              onSubmit={async (values) => {
                setSavingCategory(true)
                try {
                  if (categoryDialogMode === 'update') {
                    const updatedCategory = await updateKnowledgebaseCategory(activeWorkspace.uuid, category.uuid, values)
                    setCategory(updatedCategory)
                    notifySuccess('Category updated successfully.')
                  } else {
                    const createdCategory = await createKnowledgebaseCategory(activeWorkspace.uuid, {
                      ...values,
                      parent_uuid: category.uuid,
                    })
                    setChildCategories((current) => [...current, createdCategory])
                    notifySuccess('Child category created successfully.')
                  }
                  setCategoryDialogMode(null)
                } catch {
                  notifyError(
                    categoryDialogMode === 'update'
                      ? 'Failed to update category.'
                      : 'Failed to create child category.',
                  )
                } finally {
                  setSavingCategory(false)
                }
              }}
            />
          </Stack>
        </DialogContent>
      </Dialog>


      <ConfirmDialog
        open={knowledgebaseToDelete !== null}
        title="Delete knowledgebase?"
        description={
          knowledgebaseToDelete
            ? `This will delete "${knowledgebaseToDelete.name}" and its items.`
            : ''
        }
        confirmLabel="Delete knowledgebase"
        confirmColor="error"
        isLoading={knowledgebaseToDelete !== null && deletingKnowledgebaseUuid === knowledgebaseToDelete.uuid}
        onClose={() => {
          if (!deletingKnowledgebaseUuid) {
            setKnowledgebaseToDelete(null)
          }
        }}
        onConfirm={() => {
          if (!knowledgebaseToDelete) {
            return
          }

          setDeletingKnowledgebaseUuid(knowledgebaseToDelete.uuid)
          void deleteKnowledgebase(activeWorkspace.uuid, category.uuid, knowledgebaseToDelete.uuid)
            .then(() => {
              const nextKnowledgebases = knowledgebases.filter((entry) => entry.uuid !== knowledgebaseToDelete.uuid)
              setKnowledgebases(nextKnowledgebases)
              if (activeKnowledgebaseUuid === knowledgebaseToDelete.uuid) {
                const nextActiveUuid = nextKnowledgebases[0]?.uuid ?? null
                setActiveKnowledgebaseUuid(nextActiveUuid)
                if (nextActiveUuid) {
                  void loadItems(nextActiveUuid)
                } else {
                  setKnowledgebaseItems([])
                }
              }
              notifySuccess('Knowledgebase deleted successfully.')
              setKnowledgebaseToDelete(null)
            })
            .catch(() => {
              notifyError('Failed to delete knowledgebase.')
            })
            .finally(() => {
              setDeletingKnowledgebaseUuid(null)
            })
        }}
      />

      <ConfirmDialog
        open={itemToDelete !== null}
        title="Delete item?"
        description={
          itemToDelete ? `This will delete "${itemToDelete.name}" from the current knowledgebase.` : ''
        }
        confirmLabel="Delete item"
        confirmColor="error"
        isLoading={itemToDelete !== null && deletingItemUuid === itemToDelete.uuid}
        onClose={() => {
          if (!deletingItemUuid) {
            setItemToDelete(null)
          }
        }}
        onConfirm={() => {
          if (!itemToDelete || !activeKnowledgebase) {
            return
          }

          setDeletingItemUuid(itemToDelete.uuid)
          void deleteKnowledgebaseItem(
            activeWorkspace.uuid,
            category.uuid,
            activeKnowledgebase.uuid,
            itemToDelete.uuid,
          )
            .then(() => {
              setKnowledgebaseItems((current) => current.filter((entry) => entry.uuid !== itemToDelete.uuid))
              setKnowledgebases((current) =>
                current.map((entry) =>
                  entry.uuid === activeKnowledgebase.uuid
                    ? { ...entry, item_count: Math.max(0, entry.item_count - 1) }
                    : entry,
                ),
              )
              notifySuccess('Knowledgebase item deleted successfully.')
              setItemToDelete(null)
            })
            .catch(() => {
              notifyError('Failed to delete knowledgebase item.')
            })
            .finally(() => {
              setDeletingItemUuid(null)
            })
        }}
      />
    </Stack>
  )
}
