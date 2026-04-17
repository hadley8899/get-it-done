import { api } from '@/api/api'
import type { Board, BoardList, BoardTemplate, BoardTemplateItem } from '@/types/board'
import type { TaskDetails } from '@/types/task'

export const fetchBoards = async (workspaceUuid: string) => {
  const { data } = await api.get<{ data: Board[] }>(`boards/${workspaceUuid}`)
  return data.data
}

export const createBoard = async (
  workspaceUuid: string,
  payload: { name: string; description: string; boardTemplateUuid?: string; image?: File | null },
) => {
  const formData = new FormData()
  formData.append('name', payload.name)
  formData.append('description', payload.description)

  if (payload.boardTemplateUuid) {
    formData.append('board_template_uuid', payload.boardTemplateUuid)
  }

  if (payload.image) {
    formData.append('image', payload.image)
  }

  const { data } = await api.post<Board>(`boards/${workspaceUuid}`, formData)
  return data
}

export const fetchBoard = async (workspaceUuid: string, boardUuid: string) => {
  const { data } = await api.get<Board>(`boards/${workspaceUuid}/${boardUuid}`, {
    headers: {
      'X-Skip-Error-Toast': '1',
    },
  })
  return data
}

export const updateBoard = async (
  workspaceUuid: string,
  boardUuid: string,
  payload: {
    name: string
    description: string
    color?: string
    icon?: string
    image?: File | null
  },
) => {
  const formData = new FormData()
  formData.append('_method', 'PUT')
  formData.append('name', payload.name)
  formData.append('description', payload.description)

  if (payload.color) {
    formData.append('color', payload.color)
  }

  if (payload.icon) {
    formData.append('icon', payload.icon)
  }

  if (payload.image) {
    formData.append('image', payload.image)
  }

  const { data } = await api.post<Board>(`boards/${workspaceUuid}/${boardUuid}`, formData)
  return data
}

export const deleteBoard = async (workspaceUuid: string, boardUuid: string) => {
  await api.delete(`boards/${workspaceUuid}/${boardUuid}`)
}

export const fetchBoardTemplates = async () => {
  const { data } = await api.get<{ data: BoardTemplate[] }>('board-templates')
  return data.data
}

export const createBoardTemplate = async (payload: { name: string; description: string }) => {
  await api.post('board-templates', payload)
}

export const fetchBoardTemplate = async (boardTemplateUuid: string) => {
  const { data } = await api.get<{ data: BoardTemplate }>(`board-templates/${boardTemplateUuid}`)
  return data.data
}

export const updateBoardTemplate = async (
  boardTemplateUuid: string,
  payload: { name: string; description: string },
) => {
  const { data } = await api.put<{ success: boolean; data: BoardTemplate }>(`board-templates/${boardTemplateUuid}`, payload)
  return data.data
}

export const deleteBoardTemplate = async (boardTemplateUuid: string) => {
  await api.delete(`board-templates/${boardTemplateUuid}`)
}

export const fetchBoardTemplateItems = async (boardTemplateUuid: string) => {
  const { data } = await api.get<{ data: BoardTemplateItem[] }>(`board-templates/items/${boardTemplateUuid}`)
  return data.data
}

export const createBoardTemplateItem = async (
  boardTemplateUuid: string,
  payload: { name: string; description: string },
) => {
  await api.post(`board-templates/items/${boardTemplateUuid}`, payload)
}

export const updateBoardTemplateItem = async (
  boardTemplateUuid: string,
  boardTemplateItemUuid: string,
  payload: { name: string; description: string },
) => {
  const { data } = await api.put<{ success: boolean; data: BoardTemplateItem }>(
    `board-templates/items/${boardTemplateUuid}/${boardTemplateItemUuid}`,
    payload,
  )
  return data.data
}

export const deleteBoardTemplateItem = async (boardTemplateUuid: string, boardTemplateItemUuid: string) => {
  await api.delete(`board-templates/items/${boardTemplateUuid}/${boardTemplateItemUuid}`)
}

export const reorderBoardTemplateItems = async (boardTemplateUuid: string, boardTemplateItemUuids: string[]) => {
  await api.post(`board-templates/items/${boardTemplateUuid}/reorder`, {
    items: {
      boardTemplateItems: boardTemplateItemUuids,
    },
  })
}

export const fetchBoardListsWithTasks = async (workspaceUuid: string, boardUuid: string) => {
  const { data } = await api.get<BoardList[]>(`boards/${workspaceUuid}/${boardUuid}/boardLists`)
  return data
}

export const fetchBoardListsNoTasks = async (workspaceUuid: string, boardUuid: string) => {
  const { data } = await api.get<BoardList[]>(`boards/${workspaceUuid}/${boardUuid}/boardListsNoTasks`)
  return data
}

export const createBoardList = async (workspaceUuid: string, boardUuid: string, payload: { name: string }) => {
  const { data } = await api.post<BoardList>(`boards/${workspaceUuid}/${boardUuid}/boardLists`, payload)
  return data
}

export const updateBoardList = async (
  workspaceUuid: string,
  boardUuid: string,
  boardListUuid: string,
  payload: { name: string },
) => {
  const { data } = await api.put<BoardList>(`boards/${workspaceUuid}/${boardUuid}/boardLists/${boardListUuid}`, payload)
  return data
}

export const deleteBoardList = async (workspaceUuid: string, boardUuid: string, boardListUuid: string) => {
  const { data } = await api.delete<{ success: boolean }>(
    `boards/${workspaceUuid}/${boardUuid}/boardLists/${boardListUuid}`,
  )
  return data
}

export const createTask = async (
  workspaceUuid: string,
  boardUuid: string,
  boardListUuid: string,
  payload: {
    name: string
    description: string
    hours_worked: number | null
    assigned_to: string
  },
) => {
  const { data } = await api.post(`boards/${workspaceUuid}/${boardUuid}/${boardListUuid}/tasks`, payload)
  return data
}

export const fetchTaskDetails = async (taskUuid: string) => {
  const { data } = await api.get<TaskDetails>(`tasks/${taskUuid}`)
  return data
}

export const updateTask = async (
  taskUuid: string,
  payload: {
    name: string
    description: string
    hours_worked: number | null
    assigned_to: string
    board_list: string
  },
) => {
  const { data } = await api.put(`tasks/${taskUuid}`, payload)
  return data
}

export const deleteTask = async (taskUuid: string) => {
  await api.delete(`tasks/${taskUuid}`)
}

export const addTaskComment = async (taskUuid: string, comment: string) => {
  const { data } = await api.post(`tasks/${taskUuid}/comments`, { comment })
  return data
}

export const updateTaskComment = async (taskUuid: string, commentUuid: string, comment: string) => {
  const { data } = await api.put(`tasks/${taskUuid}/comments/${commentUuid}`, { comment })
  return data
}

export const deleteTaskComment = async (taskUuid: string, commentUuid: string) => {
  await api.delete(`tasks/${taskUuid}/comments/${commentUuid}`)
}

// Drag-and-drop operations
export const reorderBoardLists = async (
  workspaceUuid: string,
  boardUuid: string,
  boardListUuids: string[],
) => {
  await api.post(`boards/${workspaceUuid}/${boardUuid}/boardLists/reorder`, {
    boardLists: boardListUuids,
  })
}

export const moveTask = async (
  workspaceUuid: string,
  boardUuid: string,
  payload: {
    fromListUuId: string
    toListUuId: string
    fromListUuIds: string[]
    toListUuIds: string[]
  },
) => {
  await api.post(`boards/${workspaceUuid}/${boardUuid}/boardLists/move-task`, payload)
}

export const reorderTasksInList = async (
  workspaceUuid: string,
  boardUuid: string,
  boardListUuid: string,
  taskUuids: string[],
) => {
  await api.post(`boards/${workspaceUuid}/${boardUuid}/boardLists/${boardListUuid}/reorder-tasks`, {
    uuids: taskUuids,
  })
}
