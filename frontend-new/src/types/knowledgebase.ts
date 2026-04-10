export type KnowledgebaseCategory = {
  uuid: string
  name: string
  description: string
  parent: KnowledgebaseCategory | null
  position: number
  created_at: string
  updated_at: string
}

export type Knowledgebase = {
  uuid: string
  name: string
  description: string
  position: number
  created_at: string
  updated_at: string
  item_count: number
  knowledgebase_category: KnowledgebaseCategory | null
}

export type KnowledgebaseItem = {
  uuid: string
  name: string
  contents: string
  position: number
  created_at: string
  updated_at: string
}
