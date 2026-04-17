import {Button, Stack, Typography} from '@mui/material'
import {useCallback, useEffect, useMemo, useState} from 'react'
import {useNavigate, useParams} from 'react-router-dom'
import {
  DndContext,
  type DragEndEvent,
  type DragStartEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {arrayMove, SortableContext, horizontalListSortingStrategy} from '@dnd-kit/sortable'
import {DroppableList} from '@/components/boards/DroppableList'
import {BoardSettingsDialog} from '@/components/boards/BoardSettingsDialog'
import {TaskDialog} from '@/components/boards/TaskDialog'
import {EmptyState} from '@/components/EmptyState'
import {PageHeader} from '@/components/PageHeader'
import {SectionCard} from '@/components/SectionCard'
import {useActiveWorkspace} from '@/hooks/useActiveWorkspace'
import {notifyError, notifySuccess} from '@/services/toastService'
import {getStoredUser} from '@/services/authService'
import {
  addTaskComment,
  createBoardList,
  deleteTaskComment,
  deleteBoard,
  deleteBoardList,
  moveTask,
  reorderBoardLists,
  reorderTasksInList,
  updateBoardList,
  updateBoard,
  createTask,
  deleteTask,
  deleteTaskAttachment,
  fetchBoard,
  fetchBoardListsNoTasks,
  fetchBoardListsWithTasks,
  fetchBoards,
  fetchTaskDetails,
  downloadTaskAttachmentContent,
  uploadTaskAttachment,
  updateTaskComment,
  updateTask,
} from '@/services/boardService'
import {fetchWorkspaceMembers, fetchWorkspaces} from '@/services/workspaceService'
import type {Board, BoardList, BoardTask} from '@/types/board'
import type {TaskDetails} from '@/types/task'
import type {WorkspaceMember} from '@/types/workspace'

export function BoardDetailsPage() {
  const {uuid} = useParams()
  const navigate = useNavigate()
  const activeWorkspace = useActiveWorkspace()
  const currentUser = useMemo(() => getStoredUser(), [])
  const canEditBoardDetails = useMemo(() => {
    if (!activeWorkspace?.user?.uuid || !currentUser?.uuid) {
      return true
    }
    return activeWorkspace.user.uuid === currentUser.uuid
  }, [activeWorkspace?.user?.uuid, currentUser?.uuid])
  const [board, setBoard] = useState<Board | null>(null)
  const [boardLists, setBoardLists] = useState<BoardList[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingBoard, setDeletingBoard] = useState(false)
  const [workspaceMembers, setWorkspaceMembers] = useState<WorkspaceMember[]>([])
  const [taskDialogOpen, setTaskDialogOpen] = useState(false)
  const [activeTask, setActiveTask] = useState<TaskDetails | null>(null)
  const [activeTaskListUuid, setActiveTaskListUuid] = useState<string | null>(null)
  const [savingTask, setSavingTask] = useState(false)
  const [deletingTask, setDeletingTask] = useState(false)
  const [commentDraft, setCommentDraft] = useState('')
  const [savingComment, setSavingComment] = useState(false)
  const [updatingComment, setUpdatingComment] = useState(false)
  const [deletingComment, setDeletingComment] = useState(false)
  const [uploadingAttachment, setUploadingAttachment] = useState(false)
  const [deletingAttachment, setDeletingAttachment] = useState(false)
  const [boardSettingsOpen, setBoardSettingsOpen] = useState(false)
  const [savingBoardSettings, setSavingBoardSettings] = useState(false)
  const [activeTaskDragOverlay, setActiveTaskDragOverlay] = useState<BoardTask | null>(null)
  const [allWorkspaces, setAllWorkspaces] = useState<{ uuid: string; name: string }[]>([])
  const [workspaceBoards, setWorkspaceBoards] = useState<Record<string, { uuid: string; name: string }[]>>({})
  const [boardListsByBoard, setBoardListsByBoard] = useState<Record<string, { uuid: string; name: string }[]>>({})

  // Setup drag sensors
  const sensors = useSensors(
      useSensor(PointerSensor, {
        activationConstraint: {distance: 8},
      }),
  )

  const loadBoardPage = useCallback(async () => {
    setLoading(true)

    if (!uuid || !activeWorkspace?.uuid) {
      setLoading(false)
      return
    }

    try {
      const [boardData, boardListData] = await Promise.all([
        fetchBoard(activeWorkspace.uuid, uuid),
        fetchBoardListsWithTasks(activeWorkspace.uuid, uuid),
      ])

      setBoard(boardData)
      setBoardLists(boardListData)
    } catch (error) {
      if ((error as { response?: { status?: number } })?.response?.status === 404) {
        notifyError('Board not found in the selected workspace.')
        navigate('/boards')
      } else {
        notifyError('Failed to load board details.')
      }
    } finally {
      setLoading(false)
    }
  }, [activeWorkspace?.uuid, navigate, uuid])

  const loadWorkspaceMembers = useCallback(async () => {
    if (!activeWorkspace?.uuid) {
      setWorkspaceMembers([])
      return
    }

    try {
      const members = await fetchWorkspaceMembers(activeWorkspace.uuid)
      setWorkspaceMembers(members)
    } catch {
      notifyError('Failed to load workspace members.')
    }
  }, [activeWorkspace?.uuid])

  const handleDragStart = (event: DragStartEvent) => {
    const {active} = event
    const task = boardLists
        .flatMap((list) => list.tasks)
        .find((t) => t.uuid === active.id)
    setActiveTaskDragOverlay(task || null)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const {active, over} = event
    setActiveTaskDragOverlay(null)

    if (!over) {
      return
    }

    const activeTaskId = String(active.id)
    const fromContainerId = (active.data.current?.sortable?.containerId as string | undefined) ?? ''
    const overContainerId =
        (over.data.current?.sortable?.containerId as string | undefined) ??
        (boardLists.some((list) => list.uuid === String(over.id)) ? String(over.id) : '')

    if (!fromContainerId || !overContainerId) {
      return
    }

    // Find the task being dragged
    const fromListIndex = boardLists.findIndex((list) => list.uuid === fromContainerId)
    if (fromListIndex === -1) {
      return
    }
    const taskIndex = boardLists[fromListIndex].tasks.findIndex((t) => t.uuid === activeTaskId)
    if (taskIndex === -1) {
      return
    }

    // Find the target list
    const toListIndex = boardLists.findIndex((list) => list.uuid === overContainerId)
    if (toListIndex === -1) {
      return
    }

    const fromList = boardLists[fromListIndex]
    const toList = boardLists[toListIndex]

    // Create optimistic update
    const newBoardLists = boardLists.map((list) => ({
      ...list,
      tasks: list.tasks.slice(),
    }))

    if (fromListIndex === toListIndex) {
      // Reordering within the same list
      const tasks = newBoardLists[fromListIndex].tasks
      const oldIndex = tasks.findIndex((t) => t.uuid === activeTaskId)
      const overTaskId = String(over.id)
      const newIndex = tasks.findIndex((t) => t.uuid === overTaskId)

      if (oldIndex !== -1 && newIndex !== -1) {
        newBoardLists[fromListIndex].tasks = arrayMove(tasks, oldIndex, newIndex)
      }
    } else {
      // Moving to a different list
      const task = newBoardLists[fromListIndex].tasks[taskIndex]
      newBoardLists[fromListIndex].tasks.splice(taskIndex, 1)
      const overTaskId = String(over.id)
      const targetIndex = newBoardLists[toListIndex].tasks.findIndex((entry) => entry.uuid === overTaskId)
      if (targetIndex === -1) {
        newBoardLists[toListIndex].tasks.push(task)
      } else {
        newBoardLists[toListIndex].tasks.splice(targetIndex, 0, task)
      }
    }

    // Optimistic update
    setBoardLists(newBoardLists)

    // Send to server
    try {
      if (fromListIndex === toListIndex) {
        // Reorder tasks within list
        const taskUuids = newBoardLists[fromListIndex].tasks.map((t) => t.uuid)
        await reorderTasksInList(activeWorkspace!.uuid, uuid!, fromList.uuid, taskUuids)
        notifySuccess('Task reordered successfully')
      } else {
        // Move task between lists
        const fromTaskUuids = newBoardLists[fromListIndex].tasks.map((t) => t.uuid)
        const toTaskUuids = newBoardLists[toListIndex].tasks.map((t) => t.uuid)
        await moveTask(activeWorkspace!.uuid, uuid!, {
          fromListUuId: fromList.uuid,
          toListUuId: toList.uuid,
          fromListUuIds: fromTaskUuids,
          toListUuIds: toTaskUuids,
        })
        notifySuccess('Task moved successfully')
      }
    } catch {
      notifyError('Failed to update task position. Reloading board...')
      await loadBoardPage()
    }
  }

  const handleDeleteBoard = async () => {
    if (!activeWorkspace?.uuid || !uuid) {
      return
    }

    setDeletingBoard(true)
    try {
      await deleteBoard(activeWorkspace.uuid, uuid)
      notifySuccess('Board deleted successfully.')
      navigate('/boards')
    } catch {
      notifyError('Failed to delete the board.')
    } finally {
      setDeletingBoard(false)
    }
  }

  useEffect(() => {
    let isMounted = true

    void (async () => {
      await Promise.all([loadBoardPage(), loadWorkspaceMembers()])
      if (!isMounted) {
        return
      }
    })()

    return () => {
      isMounted = false
    }
  }, [loadBoardPage, loadWorkspaceMembers])

  useEffect(() => {
    if (!taskDialogOpen || !activeWorkspace?.uuid || !uuid) {
      return
    }

    const workspaceUuid = activeWorkspace.uuid
    const boardUuid = uuid
    let isMounted = true

    async function loadTaskMoveOptions() {
      try {
        const workspaces = await fetchWorkspaces()

        if (!isMounted) {
          return
        }

        setAllWorkspaces(workspaces.map((workspace) => ({uuid: workspace.uuid, name: workspace.name})))

        const activeBoards = await fetchBoards(workspaceUuid)
        const activeBoardLists = await fetchBoardListsNoTasks(workspaceUuid, boardUuid)

        if (!isMounted) {
          return
        }

        setWorkspaceBoards({
          [workspaceUuid]: activeBoards.map((entry) => ({uuid: entry.uuid, name: entry.name})),
        })
        setBoardListsByBoard({
          [boardUuid]: activeBoardLists.map((list) => ({uuid: list.uuid, name: list.name})),
        })
      } catch {
        notifyError('Failed to load workspace and board selectors.')
      }
    }

    void loadTaskMoveOptions()

    return () => {
      isMounted = false
    }
  }, [activeWorkspace?.uuid, taskDialogOpen, uuid])

  const ensureWorkspaceBoardsLoaded = useCallback(async (workspaceUuid: string) => {
    if (workspaceBoards[workspaceUuid]) {
      return
    }

    const boards = await fetchBoards(workspaceUuid)
    setWorkspaceBoards((current) => ({
      ...current,
      [workspaceUuid]: boards.map((entry) => ({uuid: entry.uuid, name: entry.name})),
    }))
  }, [workspaceBoards])

  const ensureBoardListsLoaded = useCallback(async (workspaceUuid: string, boardUuid: string) => {
    if (boardListsByBoard[boardUuid]) {
      return
    }

    const lists = await fetchBoardListsNoTasks(workspaceUuid, boardUuid)
    setBoardListsByBoard((current) => ({
      ...current,
      [boardUuid]: lists.map((entry) => ({uuid: entry.uuid, name: entry.name})),
    }))
  }, [boardListsByBoard])

  if (!activeWorkspace?.uuid) {
    return (
        <EmptyState
            title="No active workspace"
            description="Select a workspace from the top bar before opening a board."
            actionLabel="Go to workspaces"
            onAction={() => navigate('/workspaces')}
        />
    )
  }

  if (loading) {
    return <EmptyState title="Loading board"
                       description="Fetching board details and board lists from the Laravel API."/>
  }

  if (!board || !uuid) {
    return <EmptyState title="Board not found"
                       description="The requested board could not be loaded for the active workspace."/>
  }

  return (
      <Stack spacing={3}>
        <PageHeader
            eyebrow="Boards"
            title={board.name}
            description={board.description || 'No description'}
            actions={
              <>
                <Button variant="outlined" onClick={() => navigate('/boards')}>
                  Back to boards
                </Button>
                <Button variant="outlined" onClick={() => setBoardSettingsOpen(true)}>
                  Board settings
                </Button>
              </>
            }
        />

        <SectionCard
            title="Board lists"
            description="Drag tasks to reorder them or move them between lists."
        >
          {boardLists.length === 0 ? (
              <EmptyState
                  title="No lists yet"
                  description="Add the first list to start structuring work for this board."
              />
          ) : (
              <DndContext
                  sensors={sensors}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
              >
                <SortableContext
                    items={boardLists.map((list) => list.uuid)}
                    strategy={horizontalListSortingStrategy}
                >
                  <Stack direction="row" spacing={2} sx={{overflowX: 'auto', pb: 1}}>
                    {boardLists.map((boardList) => (
                        <Stack key={boardList.uuid} spacing={1.25}>
                          <DroppableList
                              boardList={boardList}
                              onTaskClick={(taskUuid) => {
                                void fetchTaskDetails(taskUuid)
                                    .then((taskDetails) => {
                                      setActiveTask(taskDetails)
                                      setActiveTaskListUuid(boardList.uuid)
                                      setCommentDraft('')
                                      setTaskDialogOpen(true)
                                    })
                                    .catch(() => {
                                      notifyError('Failed to load task details.')
                                    })
                              }}
                          />
                          <Button
                              variant="text"
                              size="small"
                              sx={{alignSelf: 'flex-start', px: 0, minWidth: 0, textTransform: 'none'}}
                              onClick={() => {
                                setActiveTask(null)
                                setActiveTaskListUuid(boardList.uuid)
                                setCommentDraft('')
                                setTaskDialogOpen(true)
                              }}
                          >
                            Add task
                          </Button>
                        </Stack>
                    ))}
                  </Stack>
                </SortableContext>
                <DragOverlay>
                  {activeTaskDragOverlay ? (
                      <div
                          style={{
                            backgroundColor: '#fff',
                            padding: '12px',
                            borderRadius: '8px',
                            boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
                            transform: 'rotate(4deg)',
                          }}
                      >
                        <Typography sx={{fontWeight: 600}}>{activeTaskDragOverlay.name}</Typography>
                      </div>
                  ) : null}
                </DragOverlay>
              </DndContext>
          )}
        </SectionCard>

        {taskDialogOpen ? (
            <TaskDialog
                open={taskDialogOpen}
                task={activeTask}
                boardLists={boardLists}
                workspaceMembers={workspaceMembers}
                workspaceOptions={allWorkspaces}
                boardOptionsByWorkspace={workspaceBoards}
                boardListOptionsByBoard={boardListsByBoard}
                initialWorkspaceUuid={activeWorkspace.uuid}
                initialBoardUuid={uuid}
                initialBoardListUuid={activeTaskListUuid}
                onWorkspaceChange={async (workspaceUuid) => {
                  await ensureWorkspaceBoardsLoaded(workspaceUuid)
                }}
                onBoardChange={async (workspaceUuid, boardUuid) => {
                  await ensureBoardListsLoaded(workspaceUuid, boardUuid)
                }}
                isSaving={savingTask}
                isDeleting={deletingTask}
                onClose={() => {
                  if (!savingTask && !deletingTask) {
                    setTaskDialogOpen(false)
                    setActiveTask(null)
                    setCommentDraft('')
                  }
                }}
                onSubmit={async (values) => {
                  if (!values.workspace_uuid || !values.board_uuid || !values.board_list) {
                    return
                  }

                  setSavingTask(true)

                  try {
                    if (activeTask?.uuid) {
                      await updateTask(activeTask.uuid, values)
                      notifySuccess('Task updated successfully.')
                    } else {
                      await createTask(values.workspace_uuid, values.board_uuid, values.board_list, {
                        name: values.name,
                        description: values.description,
                        hours_worked: values.hours_worked,
                        assigned_to: values.assigned_to,
                      })
                      notifySuccess('Task created successfully.')
                    }

                    await loadBoardPage()
                    setTaskDialogOpen(false)
                    setActiveTask(null)
                    setCommentDraft('')
                  } catch {
                    notifyError(activeTask?.uuid ? 'Failed to update the task.' : 'Failed to create the task.')
                  } finally {
                    setSavingTask(false)
                  }
                }}
                onDelete={async (taskUuid) => {
                  setDeletingTask(true)

                  try {
                    await deleteTask(taskUuid)
                    notifySuccess('Task deleted successfully.')
                    await loadBoardPage()
                    setTaskDialogOpen(false)
                    setActiveTask(null)
                    setCommentDraft('')
                  } catch {
                    notifyError('Failed to delete the task.')
                  } finally {
                    setDeletingTask(false)
                  }
                }}
                commentDraft={commentDraft}
                isCommentSaving={savingComment}
                isCommentUpdating={updatingComment}
                isCommentDeleting={deletingComment}
                isAttachmentUploading={uploadingAttachment}
                isAttachmentDeleting={deletingAttachment}
                onCommentDraftChange={setCommentDraft}
                onUploadAttachment={async (taskUuid, files) => {
                  setUploadingAttachment(true)

                  try {
                    for (const file of files) {
                      await uploadTaskAttachment(taskUuid, file)
                    }
                    const refreshedTask = await fetchTaskDetails(taskUuid)
                    setActiveTask(refreshedTask)
                    notifySuccess(
                      files.length > 1
                        ? `${files.length} attachments uploaded successfully.`
                        : 'Attachment uploaded successfully.',
                    )
                  } catch {
                    notifyError('Failed to upload attachment.')
                    throw new Error('Attachment upload failed')
                  } finally {
                    setUploadingAttachment(false)
                  }
                }}
                onDeleteAttachment={async (taskUuid, attachmentUuid) => {
                  setDeletingAttachment(true)

                  try {
                    await deleteTaskAttachment(taskUuid, attachmentUuid)
                    const refreshedTask = await fetchTaskDetails(taskUuid)
                    setActiveTask(refreshedTask)
                    notifySuccess('Attachment deleted successfully.')
                  } catch {
                    notifyError('Failed to delete attachment.')
                    throw new Error('Attachment delete failed')
                  } finally {
                    setDeletingAttachment(false)
                  }
                }}
                onGetAttachmentContent={async (taskUuid, attachmentUuid) => {
                  try {
                    return await downloadTaskAttachmentContent(taskUuid, attachmentUuid)
                  } catch {
                    throw new Error('Attachment content load failed')
                  }
                }}
                onAddComment={async (taskUuid, comment) => {
                  setSavingComment(true)

                  try {
                    await addTaskComment(taskUuid, comment.trim())
                    const refreshedTask = await fetchTaskDetails(taskUuid)
                    setActiveTask(refreshedTask)
                    setCommentDraft('')
                    notifySuccess('Comment added successfully.')
                  } catch {
                    notifyError('Failed to add comment.')
                  } finally {
                    setSavingComment(false)
                  }
                }}
                onUpdateComment={async (taskUuid, commentUuid, comment) => {
                  setUpdatingComment(true)

                  try {
                    await updateTaskComment(taskUuid, commentUuid, comment)
                    const refreshedTask = await fetchTaskDetails(taskUuid)
                    setActiveTask(refreshedTask)
                    notifySuccess('Comment updated successfully.')
                  } catch {
                    notifyError('Failed to update comment.')
                    throw new Error('Comment update failed')
                  } finally {
                    setUpdatingComment(false)
                  }
                }}
                onDeleteComment={async (taskUuid, commentUuid) => {
                  setDeletingComment(true)

                  try {
                    await deleteTaskComment(taskUuid, commentUuid)
                    const refreshedTask = await fetchTaskDetails(taskUuid)
                    setActiveTask(refreshedTask)
                    notifySuccess('Comment deleted successfully.')
                  } catch {
                    notifyError('Failed to delete comment.')
                    throw new Error('Comment delete failed')
                  } finally {
                    setDeletingComment(false)
                  }
                }}
            />
        ) : null}

        <BoardSettingsDialog
            open={boardSettingsOpen}
            board={board}
            boardLists={boardLists}
            canEditBoardDetails={canEditBoardDetails}
            isSaving={savingBoardSettings}
            isDeletingBoard={deletingBoard}
            onClose={() => {
              if (!savingBoardSettings) {
                setBoardSettingsOpen(false)
              }
            }}
            onSubmit={async (values) => {
              setSavingBoardSettings(true)

              try {
                const updatedBoard = await updateBoard(activeWorkspace.uuid, uuid, values)
                setBoard(updatedBoard)
                setBoardSettingsOpen(false)
                notifySuccess('Board updated successfully.')
              } catch {
                notifyError('Failed to update the board.')
              } finally {
                setSavingBoardSettings(false)
              }
            }}
            onCreateList={async (name) => {
              await createBoardList(activeWorkspace.uuid, uuid, {name})
              await loadBoardPage()
            }}
            onRenameList={async (listUuid, name) => {
              await updateBoardList(activeWorkspace.uuid, uuid, listUuid, {name})
            }}
            onDeleteList={async (listUuid) => {
              await deleteBoardList(activeWorkspace.uuid, uuid, listUuid)
              await loadBoardPage()
            }}
            onReorderLists={async (listUuids) => {
              await reorderBoardLists(activeWorkspace.uuid, uuid, listUuids)
              await loadBoardPage()
            }}
            onDeleteBoard={async () => {
              await handleDeleteBoard()
            }}
        />
      </Stack>
  )
}
