import { api } from '@/api/api'
import type { Knowledgebase, KnowledgebaseCategory, KnowledgebaseItem } from '@/types/knowledgebase'

export const fetchKnowledgebaseCategories = async (workspaceUuid: string) => {
  const { data } = await api.get<{ data: KnowledgebaseCategory[] }>(`knowledgebase/${workspaceUuid}/categories`)
  return data.data
}

export const createKnowledgebaseCategory = async (
  workspaceUuid: string,
  payload: { name: string; description: string; position?: number | null; parent_uuid?: string },
) => {
  const { data } = await api.post<KnowledgebaseCategory>(`knowledgebase/${workspaceUuid}/categories`, payload)
  return data
}

export const updateKnowledgebaseCategory = async (
  workspaceUuid: string,
  categoryUuid: string,
  payload: { name: string; description: string; position?: number | null },
) => {
  const { data } = await api.put<KnowledgebaseCategory>(
    `knowledgebase/${workspaceUuid}/categories/${categoryUuid}`,
    payload,
  )
  return data
}

export const fetchKnowledgebaseCategory = async (workspaceUuid: string, categoryUuid: string) => {
  const { data } = await api.get<KnowledgebaseCategory>(`knowledgebase/${workspaceUuid}/categories/${categoryUuid}`)
  return data
}

export const deleteKnowledgebaseCategory = async (workspaceUuid: string, categoryUuid: string) => {
  const { data } = await api.delete<{ success: boolean }>(`knowledgebase/${workspaceUuid}/categories/${categoryUuid}`)
  return data
}

export const fetchKnowledgebaseChildCategories = async (workspaceUuid: string, categoryUuid: string) => {
  const { data } = await api.get<{ data: KnowledgebaseCategory[] }>(
    `knowledgebase/${workspaceUuid}/categories/${categoryUuid}/children`,
  )
  return data.data
}

export const fetchKnowledgebases = async (workspaceUuid: string, categoryUuid: string) => {
  const { data } = await api.get<{ data: Knowledgebase[] }>(
    `knowledgebase/${workspaceUuid}/${categoryUuid}/knowledgebases`,
  )
  return data.data
}

export const createKnowledgebase = async (
  workspaceUuid: string,
  categoryUuid: string,
  payload: { name: string; description: string; position?: number | null },
) => {
  const { data } = await api.post<Knowledgebase>(
    `knowledgebase/${workspaceUuid}/${categoryUuid}/knowledgebases`,
    payload,
  )
  return data
}

export const updateKnowledgebase = async (
  workspaceUuid: string,
  categoryUuid: string,
  knowledgebaseUuid: string,
  payload: { name: string; description: string; position?: number | null },
) => {
  const { data } = await api.put<Knowledgebase>(
    `knowledgebase/${workspaceUuid}/${categoryUuid}/knowledgebases/${knowledgebaseUuid}`,
    payload,
  )
  return data
}

export const deleteKnowledgebase = async (
  workspaceUuid: string,
  categoryUuid: string,
  knowledgebaseUuid: string,
) => {
  const { data } = await api.delete<{ success: boolean }>(
    `knowledgebase/${workspaceUuid}/${categoryUuid}/knowledgebases/${knowledgebaseUuid}`,
  )
  return data
}

export const fetchKnowledgebaseItems = async (
  workspaceUuid: string,
  categoryUuid: string,
  knowledgebaseUuid: string,
) => {
  const { data } = await api.get<{ data: KnowledgebaseItem[] }>(
    `knowledgebase/${workspaceUuid}/${categoryUuid}/knowledgebases/${knowledgebaseUuid}/items`,
  )
  return data.data
}

export const createKnowledgebaseItem = async (
  workspaceUuid: string,
  categoryUuid: string,
  knowledgebaseUuid: string,
  payload: { name: string; contents: string },
) => {
  const { data } = await api.post<KnowledgebaseItem>(
    `knowledgebase/${workspaceUuid}/${categoryUuid}/knowledgebases/${knowledgebaseUuid}/items`,
    payload,
  )
  return data
}

export const updateKnowledgebaseItem = async (
  workspaceUuid: string,
  categoryUuid: string,
  knowledgebaseUuid: string,
  itemUuid: string,
  payload: { name: string; contents: string },
) => {
  const { data } = await api.put<KnowledgebaseItem>(
    `knowledgebase/${workspaceUuid}/${categoryUuid}/knowledgebases/${knowledgebaseUuid}/items/${itemUuid}`,
    payload,
  )
  return data
}

export const deleteKnowledgebaseItem = async (
  workspaceUuid: string,
  categoryUuid: string,
  knowledgebaseUuid: string,
  itemUuid: string,
) => {
  const { data } = await api.delete<{ success: boolean }>(
    `knowledgebase/${workspaceUuid}/${categoryUuid}/knowledgebases/${knowledgebaseUuid}/items/${itemUuid}`,
  )
  return data
}
