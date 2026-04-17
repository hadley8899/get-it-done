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

export type TaskAttachment = {
  uuid: string
  original_name: string
  mime_type?: string | null
  extension?: string | null
  size_bytes: number
  is_image: boolean
  created_at: string
  updated_at: string
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
  attachments: TaskAttachment[]
  board_list: string
  created_at: string
  updated_at: string
}
