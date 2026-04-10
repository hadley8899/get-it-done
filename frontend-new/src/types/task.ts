export type TaskComment = {
  uuid: string
  comment: string
  created_at: string
  updated_at: string
  user: {
    uuid: string
    name: string
    email: string
    avatar?: string | null
  }
}

export type TaskDetails = {
  uuid: string
  name: string
  description: string
  hours_worked: number
  user: {
    uuid: string
    name: string
    email: string
    avatar?: string | null
  }
  assigned_to?: {
    uuid: string
    name: string
    email: string
    avatar?: string | null
  } | null
  position: number
  comments: TaskComment[]
  board_list: string
  created_at: string
  updated_at: string
}
