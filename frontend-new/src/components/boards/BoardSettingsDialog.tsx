import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Stack, TextField, Typography } from '@mui/material'
import { DndContext, PointerSensor, type DragEndEvent, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { notifyError, notifySuccess } from '@/services/toastService'
import type { Board, BoardList } from '@/types/board'

type BoardSettingsValues = {
  name: string
  description: string
}

type ListDraft = {
  uuid: string
  name: string
  originalName: string
}

function SortableListDraftRow({
  entry,
  isSavingLists,
  onNameChange,
  onDelete,
}: {
  entry: ListDraft
  isSavingLists: boolean
  onNameChange: (uuid: string, name: string) => void
  onDelete: (entry: { uuid: string; name: string }) => void
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition } = useSortable({
    id: entry.uuid,
    disabled: isSavingLists,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <Stack ref={setNodeRef} style={style} direction="row" spacing={1} sx={{ alignItems: 'center' }}>
      <IconButton
        size="small"
        aria-label={`Drag ${entry.name}`}
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        disabled={isSavingLists}
      >
        ≡
      </IconButton>
      <TextField
        size="small"
        value={entry.name}
        onChange={(event) => {
          onNameChange(entry.uuid, event.target.value)
        }}
        sx={{ flex: 1 }}
      />
      <Button
        color="error"
        size="small"
        onClick={() => onDelete({ uuid: entry.uuid, name: entry.name })}
        disabled={isSavingLists}
      >
        Delete
      </Button>
    </Stack>
  )
}

export function BoardSettingsDialog({
  open,
  board,
  boardLists,
  canEditBoardDetails = true,
  isSaving = false,
  isDeletingBoard = false,
  onClose,
  onSubmit,
  onCreateList,
  onRenameList,
  onDeleteList,
  onReorderLists,
  onDeleteBoard,
}: {
  open: boolean
  board: Board | null
  boardLists: BoardList[]
  canEditBoardDetails?: boolean
  isSaving?: boolean
  isDeletingBoard?: boolean
  onClose: () => void
  onSubmit: (values: BoardSettingsValues) => Promise<void> | void
  onCreateList: (name: string) => Promise<void>
  onRenameList: (listUuid: string, name: string) => Promise<void>
  onDeleteList: (listUuid: string) => Promise<void>
  onReorderLists: (listUuids: string[]) => Promise<void>
  onDeleteBoard: () => Promise<void>
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<BoardSettingsValues>({
    defaultValues: {
      name: '',
      description: '',
    },
    mode: 'onChange',
  })

  const [newListName, setNewListName] = useState('')
  const [listDrafts, setListDrafts] = useState<ListDraft[]>([])
  const [isSavingLists, setIsSavingLists] = useState(false)
  const [listToDelete, setListToDelete] = useState<{ uuid: string; name: string } | null>(null)
  const [isDeletingList, setIsDeletingList] = useState(false)
  const [deleteBoardConfirmOpen, setDeleteBoardConfirmOpen] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  )

  const hasListChanges = useMemo(() => {
    const draftOrder = listDrafts.map((entry) => entry.uuid)
    const sourceOrder = boardLists.map((entry) => entry.uuid)
    const orderChanged = draftOrder.join('|') !== sourceOrder.join('|')
    const renamed = listDrafts.some((entry) => entry.name.trim() !== entry.originalName.trim())
    return orderChanged || renamed
  }, [boardLists, listDrafts])

  useEffect(() => {
    if (!open || !board) {
      return
    }

    reset({
      name: board.name ?? '',
      description: board.description ?? '',
    })

    setNewListName('')
    setListDrafts(
      boardLists.map((entry) => ({
        uuid: entry.uuid,
        name: entry.name,
        originalName: entry.name,
      })),
    )
  }, [board, boardLists, open, reset])

  const handleListDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) {
      return
    }

    setListDrafts((current) => {
      const oldIndex = current.findIndex((entry) => entry.uuid === String(active.id))
      const newIndex = current.findIndex((entry) => entry.uuid === String(over.id))
      if (oldIndex === -1 || newIndex === -1) {
        return current
      }
      return arrayMove(current, oldIndex, newIndex)
    })
  }

  const saveListChanges = async () => {
    const invalid = listDrafts.some((entry) => entry.name.trim().length === 0)
    if (invalid) {
      notifyError('List names cannot be empty.')
      return
    }

    setIsSavingLists(true)
    try {
      for (const draft of listDrafts) {
        const nextName = draft.name.trim()
        if (nextName !== draft.originalName.trim()) {
          await onRenameList(draft.uuid, nextName)
        }
      }

      await onReorderLists(listDrafts.map((entry) => entry.uuid))
      notifySuccess('List settings saved successfully.')
    } catch {
      notifyError('Failed to save list settings.')
    } finally {
      setIsSavingLists(false)
    }
  }

  return (
    <Dialog open={open} onClose={isSaving ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>Board settings</DialogTitle>
      <DialogContent>
        <Stack
          component="form"
          spacing={2.5}
          sx={{ pt: 1 }}
          onSubmit={handleSubmit(async (values) => {
            await onSubmit(values)
          })}
        >
          <TextField
            label="Name"
            error={Boolean(errors.name)}
            helperText={errors.name?.message}
            disabled={!canEditBoardDetails || isSaving}
            {...register('name', { required: 'Board name is required' })}
          />
          <TextField
            label="Description"
            multiline
            minRows={4}
            disabled={!canEditBoardDetails || isSaving}
            {...register('description')}
          />

          {!canEditBoardDetails ? (
            <Typography variant="body2" color="text.secondary">
              Only the workspace owner can update board name and description.
            </Typography>
          ) : null}

          <DialogActions sx={{ px: 0, pb: 0 }}>
            <Button onClick={onClose} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={!canEditBoardDetails || !isValid || isSaving}>
              {isSaving ? 'Saving...' : 'Save board'}
            </Button>
          </DialogActions>

          <Stack spacing={1.25} sx={{ pt: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              List management
            </Typography>
            <Stack direction="row" spacing={1.25}>
              <TextField
                label="New list name"
                size="small"
                value={newListName}
                onChange={(event) => setNewListName(event.target.value)}
                sx={{ flex: 1 }}
              />
              <Button
                variant="outlined"
                disabled={newListName.trim().length === 0 || isSavingLists}
                onClick={async () => {
                  setIsSavingLists(true)
                  try {
                    await onCreateList(newListName.trim())
                    setNewListName('')
                    notifySuccess('List created successfully.')
                  } catch {
                    notifyError('Failed to create list.')
                  } finally {
                    setIsSavingLists(false)
                  }
                }}
              >
                Add list
              </Button>
            </Stack>

            <Stack spacing={1}>
              {listDrafts.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No lists yet.
                </Typography>
              ) : (
                <DndContext sensors={sensors} onDragEnd={handleListDragEnd}>
                  <SortableContext items={listDrafts.map((entry) => entry.uuid)} strategy={verticalListSortingStrategy}>
                    <Stack spacing={1}>
                      {listDrafts.map((entry) => (
                        <SortableListDraftRow
                          key={entry.uuid}
                          entry={entry}
                          isSavingLists={isSavingLists}
                          onNameChange={(uuid, name) => {
                            setListDrafts((current) =>
                              current.map((item) => (item.uuid === uuid ? { ...item, name } : item)),
                            )
                          }}
                          onDelete={setListToDelete}
                        />
                      ))}
                    </Stack>
                  </SortableContext>
                </DndContext>
              )}
            </Stack>

            <Button
              variant="outlined"
              onClick={() => {
                void saveListChanges()
              }}
              disabled={!hasListChanges || isSavingLists}
            >
              {isSavingLists ? 'Saving list changes...' : 'Save list changes'}
            </Button>
          </Stack>

          <Stack spacing={1} sx={{ pt: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Dangerous actions
            </Typography>
            <Button
              color="error"
              variant="outlined"
              onClick={() => setDeleteBoardConfirmOpen(true)}
              disabled={isDeletingBoard || isSaving}
            >
              Delete board
            </Button>
          </Stack>
        </Stack>
      </DialogContent>

      <ConfirmDialog
        open={listToDelete !== null}
        title="Delete list?"
        description={
          listToDelete
            ? `This will permanently delete "${listToDelete.name}" and all tasks inside it.`
            : ''
        }
        confirmLabel="Delete list"
        confirmColor="error"
        isLoading={isDeletingList}
        onClose={() => {
          if (!isDeletingList) {
            setListToDelete(null)
          }
        }}
        onConfirm={async () => {
          if (!listToDelete) {
            return
          }
          setIsDeletingList(true)
          try {
            await onDeleteList(listToDelete.uuid)
            notifySuccess('List deleted successfully.')
            setListToDelete(null)
          } catch {
            notifyError('Failed to delete list.')
          } finally {
            setIsDeletingList(false)
          }
        }}
      />

      <ConfirmDialog
        open={deleteBoardConfirmOpen}
        title="Delete board?"
        description="This will permanently delete the board and all tasks inside it."
        confirmLabel="Delete board"
        confirmColor="error"
        isLoading={isDeletingBoard}
        onClose={() => {
          if (!isDeletingBoard) {
            setDeleteBoardConfirmOpen(false)
          }
        }}
        onConfirm={async () => {
          await onDeleteBoard()
        }}
      />
    </Dialog>
  )
}
