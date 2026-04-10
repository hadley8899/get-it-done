import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { DndContext, PointerSensor, type DragEndEvent, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { EmptyState } from '@/components/EmptyState'
import { PageHeader } from '@/components/PageHeader'
import { SectionCard } from '@/components/SectionCard'
import {
  createBoardTemplate,
  createBoardTemplateItem,
  deleteBoardTemplate,
  deleteBoardTemplateItem,
  fetchBoardTemplate,
  fetchBoardTemplateItems,
  fetchBoardTemplates,
  reorderBoardTemplateItems,
  updateBoardTemplate,
  updateBoardTemplateItem,
} from '@/services/boardService'
import { notifyError, notifySuccess } from '@/services/toastService'
import type { BoardTemplate, BoardTemplateItem } from '@/types/board'

type TemplateFormValues = {
  name: string
  description: string
}

type TemplateItemFormValues = {
  name: string
  description: string
}

function SortableTemplateItemRow({
  item,
  onEdit,
  onDelete,
}: {
  item: BoardTemplateItem
  onEdit: (item: BoardTemplateItem) => void
  onDelete: (item: BoardTemplateItem) => void
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition } = useSortable({ id: item.uuid })
  const style = { transform: CSS.Transform.toString(transform), transition }

  return (
    <Stack ref={setNodeRef} style={style} direction="row" spacing={1} sx={{ alignItems: 'center', border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 1 }}>
      <span ref={setActivatorNodeRef} {...attributes} {...listeners} style={{ cursor: 'grab', userSelect: 'none', padding: '0 4px' }}>
        ≡
      </span>
      <Stack sx={{ flex: 1 }}>
        <Typography sx={{ fontWeight: 600 }}>{item.name}</Typography>
        <Typography variant="body2" color="text.secondary">
          {item.description}
        </Typography>
      </Stack>
      <Button size="small" variant="text" sx={{ textTransform: 'none' }} onClick={() => onEdit(item)}>
        Edit
      </Button>
      <Button size="small" color="error" variant="text" sx={{ textTransform: 'none' }} onClick={() => onDelete(item)}>
        Delete
      </Button>
    </Stack>
  )
}

export function BoardTemplatesPage() {
  const [templates, setTemplates] = useState<BoardTemplate[]>([])
  const [selectedTemplateUuid, setSelectedTemplateUuid] = useState<string>('')
  const [selectedTemplate, setSelectedTemplate] = useState<BoardTemplate | null>(null)
  const [items, setItems] = useState<BoardTemplateItem[]>([])
  const [loadingTemplates, setLoadingTemplates] = useState(true)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [savingTemplate, setSavingTemplate] = useState(false)
  const [savingItems, setSavingItems] = useState(false)
  const [createTemplateOpen, setCreateTemplateOpen] = useState(false)
  const [deleteTemplateOpen, setDeleteTemplateOpen] = useState(false)
  const [deleteItemTarget, setDeleteItemTarget] = useState<BoardTemplateItem | null>(null)
  const [editingItem, setEditingItem] = useState<BoardTemplateItem | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  )

  const {
    register: registerTemplate,
    handleSubmit: handleTemplateSubmit,
    reset: resetTemplate,
    formState: { isValid: isTemplateValid },
  } = useForm<TemplateFormValues>({ defaultValues: { name: '', description: '' }, mode: 'onChange' })

  const {
    register: registerCreateTemplate,
    handleSubmit: handleCreateTemplateSubmit,
    reset: resetCreateTemplate,
    formState: { isValid: isCreateTemplateValid },
  } = useForm<TemplateFormValues>({ defaultValues: { name: '', description: '' }, mode: 'onChange' })

  const {
    register: registerItem,
    handleSubmit: handleItemSubmit,
    reset: resetItem,
    formState: { isValid: isItemValid },
  } = useForm<TemplateItemFormValues>({ defaultValues: { name: '', description: '' }, mode: 'onChange' })

  const {
    register: registerEditItem,
    handleSubmit: handleEditItemSubmit,
    reset: resetEditItem,
    formState: { isValid: isEditItemValid },
  } = useForm<TemplateItemFormValues>({ defaultValues: { name: '', description: '' }, mode: 'onChange' })

  const selectedTemplateName = useMemo(
    () => templates.find((entry) => entry.uuid === selectedTemplateUuid)?.name ?? '',
    [selectedTemplateUuid, templates],
  )

  const loadTemplates = async () => {
    setLoadingTemplates(true)
    try {
      const data = await fetchBoardTemplates()
      setTemplates(data)
      if (data.length > 0) {
        setSelectedTemplateUuid((current) => (current && data.some((entry) => entry.uuid === current) ? current : data[0].uuid))
      } else {
        setSelectedTemplateUuid('')
      }
    } catch {
      notifyError('Failed to load board templates.')
    } finally {
      setLoadingTemplates(false)
    }
  }

  const loadTemplateDetails = useCallback(async (templateUuid: string) => {
    setLoadingDetails(true)
    try {
      const [templateData, itemData] = await Promise.all([
        fetchBoardTemplate(templateUuid),
        fetchBoardTemplateItems(templateUuid),
      ])
      setSelectedTemplate(templateData)
      setItems(itemData)
      resetTemplate({ name: templateData.name, description: templateData.description })
      resetItem({ name: '', description: '' })
    } catch {
      notifyError('Failed to load template details.')
    } finally {
      setLoadingDetails(false)
    }
  }, [resetItem, resetTemplate])

  useEffect(() => {
    void loadTemplates()
  }, [])

  useEffect(() => {
    if (!selectedTemplateUuid) {
      setSelectedTemplate(null)
      setItems([])
      return
    }
    void loadTemplateDetails(selectedTemplateUuid)
  }, [loadTemplateDetails, selectedTemplateUuid])

  const handleItemDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id || !selectedTemplateUuid) {
      return
    }

    const oldIndex = items.findIndex((entry) => entry.uuid === String(active.id))
    const newIndex = items.findIndex((entry) => entry.uuid === String(over.id))
    if (oldIndex === -1 || newIndex === -1) {
      return
    }

    const nextItems = arrayMove(items, oldIndex, newIndex)
    setItems(nextItems)

    try {
      await reorderBoardTemplateItems(selectedTemplateUuid, nextItems.map((entry) => entry.uuid))
      notifySuccess('Template items reordered successfully.')
    } catch {
      notifyError('Failed to reorder template items.')
      await loadTemplateDetails(selectedTemplateUuid)
    }
  }

  return (
    <Stack spacing={3}>
      <PageHeader
        eyebrow="Boards"
        title="Board templates"
        description="Create reusable board list blueprints and maintain template items order."
        actions={
          <Button variant="contained" onClick={() => setCreateTemplateOpen(true)}>
            New template
          </Button>
        }
      />

      <SectionCard title="Templates" description="Pick a template to edit or create a new one.">
        {loadingTemplates ? (
          <EmptyState title="Loading templates" description="Fetching templates from the API." />
        ) : templates.length === 0 ? (
          <EmptyState title="No templates yet" description="Create your first template to speed up board setup." />
        ) : (
          <Stack spacing={1}>
            {templates.map((template) => (
              <Stack key={template.uuid} direction="row" spacing={1} sx={{ alignItems: 'center', border: '1px solid', borderColor: selectedTemplateUuid === template.uuid ? 'primary.main' : 'divider', borderRadius: 1, p: 1.25 }}>
                <Stack sx={{ flex: 1 }}>
                  <Typography sx={{ fontWeight: 700 }}>{template.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {template.description}
                  </Typography>
                </Stack>
                <Button variant={selectedTemplateUuid === template.uuid ? 'contained' : 'outlined'} onClick={() => setSelectedTemplateUuid(template.uuid)}>
                  Manage
                </Button>
              </Stack>
            ))}
          </Stack>
        )}
      </SectionCard>

      <SectionCard title="Template details" description={selectedTemplateName ? `Editing ${selectedTemplateName}` : 'Select a template first.'}>
        {!selectedTemplateUuid ? (
          <EmptyState title="No template selected" description="Select a template above to edit details and items." />
        ) : loadingDetails || !selectedTemplate ? (
          <EmptyState title="Loading template" description="Fetching selected template details and items." />
        ) : (
          <Stack spacing={2}>
            <TextField label="Template name" {...registerTemplate('name', { required: true })} />
            <TextField label="Description" multiline minRows={3} {...registerTemplate('description', { required: true })} />
            <Stack direction="row" spacing={1.25}>
              <Button
                variant="contained"
                disabled={!isTemplateValid || savingTemplate}
                onClick={() => {
                  void handleTemplateSubmit(async (values) => {
                    if (!selectedTemplateUuid) {
                      return
                    }
                    setSavingTemplate(true)
                    try {
                      await updateBoardTemplate(selectedTemplateUuid, values)
                      notifySuccess('Template updated successfully.')
                      await loadTemplates()
                      await loadTemplateDetails(selectedTemplateUuid)
                    } catch {
                      notifyError('Failed to update template.')
                    } finally {
                      setSavingTemplate(false)
                    }
                  })()
                }}
              >
                {savingTemplate ? 'Saving...' : 'Save template'}
              </Button>
              <Button color="error" variant="outlined" onClick={() => setDeleteTemplateOpen(true)} disabled={savingTemplate}>
                Delete template
              </Button>
            </Stack>

            <Typography variant="subtitle1" sx={{ fontWeight: 700, pt: 1 }}>
              Template items
            </Typography>

            <Stack component="form" spacing={1.25} onSubmit={handleItemSubmit(async (values) => {
              if (!selectedTemplateUuid) {
                return
              }
              setSavingItems(true)
              try {
                await createBoardTemplateItem(selectedTemplateUuid, values)
                resetItem({ name: '', description: '' })
                notifySuccess('Template item added successfully.')
                await loadTemplateDetails(selectedTemplateUuid)
              } catch {
                notifyError('Failed to add template item.')
              } finally {
                setSavingItems(false)
              }
            })}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.25}>
                <TextField label="Item name" size="small" sx={{ flex: 1 }} {...registerItem('name', { required: true })} />
                <TextField label="Item description" size="small" sx={{ flex: 2 }} {...registerItem('description', { required: true })} />
                <Button type="submit" variant="outlined" disabled={!isItemValid || savingItems}>
                  Add item
                </Button>
              </Stack>
            </Stack>

            {items.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No template items yet.
              </Typography>
            ) : (
              <DndContext sensors={sensors} onDragEnd={handleItemDragEnd}>
                <SortableContext items={items.map((entry) => entry.uuid)} strategy={verticalListSortingStrategy}>
                  <Stack spacing={1}>
                    {items.map((item) => (
                      <SortableTemplateItemRow
                        key={item.uuid}
                        item={item}
                        onEdit={(entry) => {
                          setEditingItem(entry)
                          resetEditItem({ name: entry.name, description: entry.description })
                        }}
                        onDelete={setDeleteItemTarget}
                      />
                    ))}
                  </Stack>
                </SortableContext>
              </DndContext>
            )}
          </Stack>
        )}
      </SectionCard>

      <Dialog open={createTemplateOpen} onClose={() => setCreateTemplateOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>New board template</DialogTitle>
        <DialogContent>
          <Stack component="form" spacing={2} sx={{ pt: 1 }} onSubmit={handleCreateTemplateSubmit(async (values) => {
            setSavingTemplate(true)
            try {
              await createBoardTemplate(values)
              notifySuccess('Board template created successfully.')
              resetCreateTemplate({ name: '', description: '' })
              setCreateTemplateOpen(false)
              await loadTemplates()
            } catch {
              notifyError('Failed to create board template.')
            } finally {
              setSavingTemplate(false)
            }
          })}>
            <TextField label="Template name" {...registerCreateTemplate('name', { required: true })} />
            <TextField label="Description" multiline minRows={3} {...registerCreateTemplate('description', { required: true })} />
            <DialogActions sx={{ px: 0 }}>
              <Button onClick={() => setCreateTemplateOpen(false)} disabled={savingTemplate}>Cancel</Button>
              <Button type="submit" variant="contained" disabled={!isCreateTemplateValid || savingTemplate}>
                Create
              </Button>
            </DialogActions>
          </Stack>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(editingItem)} onClose={() => setEditingItem(null)} fullWidth maxWidth="sm">
        <DialogTitle>Edit template item</DialogTitle>
        <DialogContent>
          <Stack component="form" spacing={2} sx={{ pt: 1 }} onSubmit={handleEditItemSubmit(async (values) => {
            if (!selectedTemplateUuid || !editingItem) {
              return
            }
            setSavingItems(true)
            try {
              await updateBoardTemplateItem(selectedTemplateUuid, editingItem.uuid, values)
              notifySuccess('Template item updated successfully.')
              setEditingItem(null)
              await loadTemplateDetails(selectedTemplateUuid)
            } catch {
              notifyError('Failed to update template item.')
            } finally {
              setSavingItems(false)
            }
          })}>
            <TextField label="Item name" {...registerEditItem('name', { required: true })} />
            <TextField label="Description" multiline minRows={3} {...registerEditItem('description', { required: true })} />
            <DialogActions sx={{ px: 0 }}>
              <Button onClick={() => setEditingItem(null)} disabled={savingItems}>Cancel</Button>
              <Button type="submit" variant="contained" disabled={!isEditItemValid || savingItems}>Save</Button>
            </DialogActions>
          </Stack>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteTemplateOpen}
        title="Delete template?"
        description="This will permanently delete the board template and its items."
        confirmLabel="Delete template"
        confirmColor="error"
        isLoading={savingTemplate}
        onClose={() => {
          if (!savingTemplate) {
            setDeleteTemplateOpen(false)
          }
        }}
        onConfirm={async () => {
          if (!selectedTemplateUuid) {
            return
          }
          setSavingTemplate(true)
          try {
            await deleteBoardTemplate(selectedTemplateUuid)
            notifySuccess('Template deleted successfully.')
            setDeleteTemplateOpen(false)
            setSelectedTemplate(null)
            setItems([])
            await loadTemplates()
          } catch {
            notifyError('Failed to delete template.')
          } finally {
            setSavingTemplate(false)
          }
        }}
      />

      <ConfirmDialog
        open={Boolean(deleteItemTarget)}
        title="Delete template item?"
        description={deleteItemTarget ? `Delete "${deleteItemTarget.name}" from this template?` : ''}
        confirmLabel="Delete item"
        confirmColor="error"
        isLoading={savingItems}
        onClose={() => {
          if (!savingItems) {
            setDeleteItemTarget(null)
          }
        }}
        onConfirm={async () => {
          if (!selectedTemplateUuid || !deleteItemTarget) {
            return
          }
          setSavingItems(true)
          try {
            await deleteBoardTemplateItem(selectedTemplateUuid, deleteItemTarget.uuid)
            notifySuccess('Template item deleted successfully.')
            setDeleteItemTarget(null)
            await loadTemplateDetails(selectedTemplateUuid)
          } catch {
            notifyError('Failed to delete template item.')
          } finally {
            setSavingItems(false)
          }
        }}
      />
    </Stack>
  )
}
