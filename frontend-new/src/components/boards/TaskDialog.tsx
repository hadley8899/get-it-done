import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { getStoredUser } from '@/services/authService'
import type { BoardList } from '@/types/board'
import type { TaskDetails } from '@/types/task'
import type { WorkspaceMember } from '@/types/workspace'

type TaskFormValues = {
  name: string
  description: string
  hours_worked: string
  assigned_to: string
  workspace_uuid: string
  board_uuid: string
  board_list: string
}

export function TaskDialog({
  open,
  task,
  boardLists,
  workspaceMembers,
  workspaceOptions,
  boardOptionsByWorkspace,
  boardListOptionsByBoard,
  initialWorkspaceUuid,
  initialBoardUuid,
  initialBoardListUuid,
  onWorkspaceChange,
  onBoardChange,
  isSaving = false,
  isDeleting = false,
  commentDraft = '',
  isCommentSaving = false,
  isCommentUpdating = false,
  isCommentDeleting = false,
  onClose,
  onSubmit,
  onDelete,
  onCommentDraftChange,
  onAddComment,
  onUpdateComment,
  onDeleteComment,
}: {
  open: boolean
  task: TaskDetails | null
  boardLists: BoardList[]
  workspaceMembers: WorkspaceMember[]
  workspaceOptions: { uuid: string; name: string }[]
  boardOptionsByWorkspace: Record<string, { uuid: string; name: string }[]>
  boardListOptionsByBoard: Record<string, { uuid: string; name: string }[]>
  initialWorkspaceUuid?: string | null
  initialBoardUuid?: string | null
  initialBoardListUuid?: string | null
  onWorkspaceChange?: (workspaceUuid: string) => Promise<void> | void
  onBoardChange?: (workspaceUuid: string, boardUuid: string) => Promise<void> | void
  isSaving?: boolean
  isDeleting?: boolean
  commentDraft?: string
  isCommentSaving?: boolean
  isCommentUpdating?: boolean
  isCommentDeleting?: boolean
  onClose: () => void
  onSubmit: (values: {
    name: string
    description: string
    hours_worked: number | null
    assigned_to: string
    workspace_uuid: string
    board_uuid: string
    board_list: string
  }) => Promise<void> | void
  onDelete: (taskUuid: string) => Promise<void> | void
  onCommentDraftChange: (value: string) => void
  onAddComment: (taskUuid: string, comment: string) => Promise<void> | void
  onUpdateComment: (taskUuid: string, commentUuid: string, comment: string) => Promise<void> | void
  onDeleteComment: (taskUuid: string, commentUuid: string) => Promise<void> | void
}) {
  const isEditing = Boolean(task?.uuid)
  const currentUser = getStoredUser()
  const [editingCommentUuid, setEditingCommentUuid] = useState<string | null>(null)
  const [editingCommentValue, setEditingCommentValue] = useState('')
  const [commentToDeleteUuid, setCommentToDeleteUuid] = useState<string | null>(null)
  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<TaskFormValues>({
    defaultValues: {
      name: '',
      description: '',
      hours_worked: '0',
      assigned_to: '',
      workspace_uuid: initialWorkspaceUuid ?? '',
      board_uuid: initialBoardUuid ?? '',
      board_list: initialBoardListUuid ?? '',
    },
    mode: 'onChange',
  })

  const selectedWorkspaceUuid = watch('workspace_uuid')
  const selectedBoardUuid = watch('board_uuid')
  const selectedBoardListUuid = watch('board_list')

  const boardOptions = useMemo(
    () => (selectedWorkspaceUuid ? boardOptionsByWorkspace[selectedWorkspaceUuid] ?? [] : []),
    [boardOptionsByWorkspace, selectedWorkspaceUuid],
  )

  const boardListOptions = useMemo(() => {
    if (selectedBoardUuid && boardListOptionsByBoard[selectedBoardUuid]) {
      return boardListOptionsByBoard[selectedBoardUuid]
    }
    return boardLists.map((entry) => ({ uuid: entry.uuid, name: entry.name }))
  }, [boardListOptionsByBoard, boardLists, selectedBoardUuid])

  useEffect(() => {
    if (!open) {
      return
    }

    const initialWorkspace = initialWorkspaceUuid ?? ''
    const initialBoardOptions = initialWorkspace ? boardOptionsByWorkspace[initialWorkspace] ?? [] : []
    const initialBoardUuids = new Set(initialBoardOptions.map((entry) => entry.uuid))
    const initialBoard =
      initialBoardUuid && initialBoardUuids.has(initialBoardUuid)
        ? initialBoardUuid
        : initialBoardOptions[0]?.uuid ?? ''
    const initialBoardListOptions = initialBoard
      ? boardListOptionsByBoard[initialBoard] ?? []
      : boardLists.map((entry) => ({ uuid: entry.uuid, name: entry.name }))
    const availableBoardListUuids = new Set(initialBoardListOptions.map((entry) => entry.uuid))
    const availableMemberUuids = new Set(workspaceMembers.map((entry) => entry.user.uuid))

    const preferredBoardList = task?.board_list ?? initialBoardListUuid ?? initialBoardListOptions[0]?.uuid ?? ''
    const resolvedBoardList = availableBoardListUuids.has(preferredBoardList)
      ? preferredBoardList
      : initialBoardListOptions[0]?.uuid ?? ''

    const preferredAssignedTo = task?.assigned_to?.uuid ?? ''
    const resolvedAssignedTo = preferredAssignedTo && availableMemberUuids.has(preferredAssignedTo) ? preferredAssignedTo : ''

    reset({
      name: task?.name ?? '',
      description: task?.description ?? '',
      hours_worked: typeof task?.hours_worked === 'number' ? String(task.hours_worked) : '0',
      assigned_to: resolvedAssignedTo,
      workspace_uuid: initialWorkspace,
      board_uuid: initialBoard,
      board_list: resolvedBoardList,
    })
  }, [
    boardListOptionsByBoard,
    boardLists,
    boardOptionsByWorkspace,
    initialBoardListUuid,
    initialBoardUuid,
    initialWorkspaceUuid,
    open,
    reset,
    task,
    workspaceMembers,
  ])

  useEffect(() => {
    if (!open) {
      return
    }

    const workspaceIsValid =
      selectedWorkspaceUuid !== '' &&
      workspaceOptions.some((workspace) => workspace.uuid === selectedWorkspaceUuid)

    if (!workspaceIsValid) {
      const fallbackWorkspace = workspaceOptions[0]?.uuid ?? ''
      if (fallbackWorkspace !== selectedWorkspaceUuid) {
        setValue('workspace_uuid', fallbackWorkspace, { shouldValidate: true })
      }
      return
    }

    const nextBoardOptions = boardOptionsByWorkspace[selectedWorkspaceUuid] ?? []
    const boardIsValid = nextBoardOptions.some((boardOption) => boardOption.uuid === selectedBoardUuid)

    if (!boardIsValid) {
      const fallbackBoard = nextBoardOptions[0]?.uuid ?? ''
      if (fallbackBoard !== selectedBoardUuid) {
        setValue('board_uuid', fallbackBoard, { shouldValidate: true })
      }

      const fallbackBoardLists = fallbackBoard
        ? boardListOptionsByBoard[fallbackBoard] ?? []
        : []
      const fallbackBoardList = fallbackBoardLists[0]?.uuid ?? ''
      setValue('board_list', fallbackBoardList, { shouldValidate: true })
      return
    }

    const nextBoardListOptions = selectedBoardUuid
      ? boardListOptionsByBoard[selectedBoardUuid] ?? []
      : []
    const boardListIsValid = nextBoardListOptions.some((listOption) => listOption.uuid === selectedBoardListUuid)

    if (!boardListIsValid) {
      setValue('board_list', nextBoardListOptions[0]?.uuid ?? '', { shouldValidate: true })
    }
  }, [
    boardListOptionsByBoard,
    boardOptionsByWorkspace,
    open,
    selectedBoardUuid,
    selectedBoardListUuid,
    selectedWorkspaceUuid,
    setValue,
    workspaceOptions,
  ])

  return (
    <Dialog open={open} onClose={isSaving || isDeleting ? undefined : onClose} fullWidth maxWidth="md">
      <DialogTitle>{isEditing ? 'Edit task' : 'Add task'}</DialogTitle>
      <DialogContent>
        <Stack
          component="form"
          spacing={2.5}
          sx={{ pt: 1 }}
          onSubmit={handleSubmit(async (values) => {
            await onSubmit({
              name: values.name,
              description: values.description,
              hours_worked: values.hours_worked === '' ? null : Number(values.hours_worked),
              assigned_to: values.assigned_to,
              workspace_uuid: values.workspace_uuid,
              board_uuid: values.board_uuid,
              board_list: values.board_list,
            })
          })}
        >
          <TextField
            label="Title"
            error={Boolean(errors.name)}
            helperText={errors.name?.message}
            {...register('name', { required: 'Task title is required' })}
          />
          <TextField
            label="Hours worked"
            type="number"
            error={Boolean(errors.hours_worked)}
            helperText={errors.hours_worked?.message}
            {...register('hours_worked')}
          />
          <Controller
            name="workspace_uuid"
            control={control}
            rules={{ required: 'Workspace is required' }}
            render={({ field, fieldState }) => (
              <TextField
                select
                label="Workspace"
                value={workspaceOptions.some((workspace) => workspace.uuid === field.value) ? field.value : ''}
                onChange={(event) => {
                  field.onChange(event.target.value)
                  const nextBoards = boardOptionsByWorkspace[event.target.value] ?? []
                  const nextBoard = nextBoards[0]?.uuid ?? ''
                  setValue('board_uuid', nextBoard, { shouldValidate: true })
                  setValue('board_list', (boardListOptionsByBoard[nextBoard] ?? [])[0]?.uuid ?? '', { shouldValidate: true })
                  void onWorkspaceChange?.(event.target.value)
                }}
                onBlur={field.onBlur}
                inputRef={field.ref}
                error={Boolean(fieldState.error)}
                helperText={fieldState.error?.message}
              >
                {workspaceOptions.map((workspace) => (
                  <MenuItem key={workspace.uuid} value={workspace.uuid}>
                    {workspace.name}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
          <Controller
            name="board_uuid"
            control={control}
            rules={{ required: 'Board is required' }}
            render={({ field, fieldState }) => (
              <TextField
                select
                label="Board"
                value={boardOptions.some((boardOption) => boardOption.uuid === field.value) ? field.value : ''}
                onChange={(event) => {
                  field.onChange(event.target.value)
                  setValue('board_list', (boardListOptionsByBoard[event.target.value] ?? [])[0]?.uuid ?? '', { shouldValidate: true })
                  if (selectedWorkspaceUuid) {
                    void onBoardChange?.(selectedWorkspaceUuid, event.target.value)
                  }
                }}
                onBlur={field.onBlur}
                inputRef={field.ref}
                error={Boolean(fieldState.error)}
                helperText={fieldState.error?.message}
              >
                {boardOptions.map((boardOption) => (
                  <MenuItem key={boardOption.uuid} value={boardOption.uuid}>
                    {boardOption.name}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
          <Controller
            name="board_list"
            control={control}
            rules={{ required: 'Task list is required' }}
            render={({ field, fieldState }) => (
              <TextField
                select
                label="Task list"
                value={boardListOptions.some((list) => list.uuid === field.value) ? field.value : ''}
                onChange={field.onChange}
                onBlur={field.onBlur}
                inputRef={field.ref}
                error={Boolean(fieldState.error)}
                helperText={fieldState.error?.message}
              >
                {boardListOptions.map((list) => (
                  <MenuItem key={list.uuid} value={list.uuid}>
                    {list.name}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
          <TextField
            label="Description"
            multiline
            minRows={6}
            {...register('description')}
          />
          <Controller
            name="assigned_to"
            control={control}
            render={({ field }) => (
              <TextField
                select
                label="Assigned"
                value={field.value ?? ''}
                onChange={field.onChange}
                onBlur={field.onBlur}
                inputRef={field.ref}
              >
                <MenuItem value="">Unassigned</MenuItem>
                {workspaceMembers.map((member) => (
                  <MenuItem key={member.uuid ?? member.user.uuid} value={member.user.uuid}>
                    {member.user.name}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />

          <DialogActions sx={{ px: 0, pb: 0 }}>
            {isEditing && task?.uuid ? (
              <Button
                color="error"
                onClick={() => {
                  void onDelete(task.uuid)
                }}
                disabled={isSaving || isDeleting}
                sx={{ mr: 'auto' }}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
            ) : null}
            <Button onClick={onClose} disabled={isSaving || isDeleting}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={!isValid || isSaving || isDeleting}>
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </DialogActions>

          {task?.comments?.length ? (
            <Stack spacing={1}>
              <Typography variant="h3" sx={{ fontSize: '1rem' }}>
                Comments
              </Typography>
              {task.comments.map((comment) => (
                <Stack key={comment.uuid} spacing={0.5} sx={{ border: '1px solid rgba(19, 34, 56, 0.08)', borderRadius: 2, p: 1.5 }}>
                  <Stack direction="row" sx={{ alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, flex: 1 }}>
                      {comment.user.name}
                    </Typography>
                    {currentUser?.uuid === comment.user.uuid ? (
                      <>
                        <Button
                          size="small"
                          variant="text"
                          sx={{ minWidth: 0, px: 0.75, textTransform: 'none' }}
                          disabled={isCommentUpdating || isCommentDeleting}
                          onClick={() => {
                            setEditingCommentUuid(comment.uuid)
                            setEditingCommentValue(comment.comment)
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          variant="text"
                          sx={{ minWidth: 0, px: 0.75, textTransform: 'none' }}
                          disabled={isCommentUpdating || isCommentDeleting}
                          onClick={() => {
                            setCommentToDeleteUuid(comment.uuid)
                          }}
                        >
                          Delete
                        </Button>
                      </>
                    ) : null}
                  </Stack>

                  {editingCommentUuid === comment.uuid ? (
                    <Stack spacing={1}>
                      <TextField
                        multiline
                        minRows={2}
                        value={editingCommentValue}
                        onChange={(event) => setEditingCommentValue(event.target.value)}
                      />
                      <Stack direction="row" spacing={1}>
                        <Button
                          size="small"
                          variant="outlined"
                          disabled={isCommentUpdating || editingCommentValue.trim().length === 0 || !task?.uuid}
                          onClick={async () => {
                            if (!task?.uuid) {
                              return
                            }
                            try {
                              await onUpdateComment(task.uuid, comment.uuid, editingCommentValue.trim())
                              setEditingCommentUuid(null)
                              setEditingCommentValue('')
                            } catch {
                              // Parent handler already surfaces the error toast.
                            }
                          }}
                        >
                          {isCommentUpdating ? 'Saving...' : 'Save'}
                        </Button>
                        <Button
                          size="small"
                          disabled={isCommentUpdating}
                          onClick={() => {
                            setEditingCommentUuid(null)
                            setEditingCommentValue('')
                          }}
                        >
                          Cancel
                        </Button>
                      </Stack>
                    </Stack>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      {comment.comment}
                    </Typography>
                  )}
                </Stack>
              ))}
            </Stack>
          ) : null}

          {isEditing && task?.uuid ? (
            <Stack spacing={1.25}>
              <Typography variant="h3" sx={{ fontSize: '1rem' }}>
                Add comment
              </Typography>
              <TextField
                label="Comment"
                multiline
                minRows={3}
                value={commentDraft}
                onChange={(event) => onCommentDraftChange(event.target.value)}
              />
              <Stack direction="row" spacing={1.5}>
                <Button
                  variant="outlined"
                  disabled={isCommentSaving || commentDraft.trim().length === 0}
                  onClick={() => {
                    void onAddComment(task.uuid, commentDraft)
                  }}
                >
                  {isCommentSaving ? 'Adding...' : 'Add comment'}
                </Button>
              </Stack>
              {!task.comments?.length ? (
                <Alert severity="info">No comments yet.</Alert>
              ) : null}
            </Stack>
          ) : null}

        </Stack>
      </DialogContent>

      <ConfirmDialog
        open={Boolean(commentToDeleteUuid)}
        title="Delete comment?"
        description="This comment will be permanently deleted."
        confirmLabel="Delete comment"
        confirmColor="error"
        isLoading={isCommentDeleting}
        onClose={() => {
          if (!isCommentDeleting) {
            setCommentToDeleteUuid(null)
          }
        }}
        onConfirm={async () => {
          if (!task?.uuid || !commentToDeleteUuid) {
            return
          }
          try {
            await onDeleteComment(task.uuid, commentToDeleteUuid)
            setCommentToDeleteUuid(null)
          } catch {
            // Parent handler already surfaces the error toast.
          }
        }}
      />
    </Dialog>
  )
}
