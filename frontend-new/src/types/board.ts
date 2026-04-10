export type Board = {
  uuid: string
  name: string
  description: string
  color?: string | null
  icon?: string | null
  image?: string | null
}

export type BoardTask = {
  uuid: string
  name: string
  description: string
  position: number
  created_at: string
  updated_at: string
  assigned_to?: {
    uuid: string
    name: string
    email: string
    avatar?: string | null
  } | null
}

export type BoardList = {
  uuid: string
  name: string
  position: number
  created_at?: string
  updated_at?: string
  tasks: BoardTask[]
}

export type BoardTemplate = {
  uuid: string
  name: string
  items: string
  description: string
  created_at: string
  updated_at: string
}

export type BoardTemplateItem = {
  uuid: string
  board_template_uuid: string
  name: string
  description: string
  order: number
  created_at: string
  updated_at: string
}

