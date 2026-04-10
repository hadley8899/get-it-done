import { api } from '@/api/api'
import type { Workspace, WorkspaceInvite, WorkspaceListResponse, WorkspaceMember } from '@/types/workspace'

const ACTIVE_WORKSPACE_KEY = 'activeWorkspace'

export const fetchWorkspaces = async () => {
  const { data } = await api.get<WorkspaceListResponse>('workspaces')
  return data.data
}

export const fetchWorkspace = async (uuid: string) => {
  const { data } = await api.get<Workspace>(`workspaces/${uuid}`)
  return data
}

export const createWorkspace = async (payload: { name: string; description: string }) => {
  const { data } = await api.post<Workspace>('workspaces', payload)
  return data
}

export const updateWorkspace = async (uuid: string, payload: { name: string; description: string }) => {
  const { data } = await api.put<Workspace>(`workspaces/${uuid}`, payload)
  return data
}

export const deleteWorkspace = async (uuid: string) => {
  const { data } = await api.delete<{ success: boolean }>(`workspaces/${uuid}`)
  return data
}

export const fetchWorkspaceMembers = async (uuid: string) => {
  const { data } = await api.get<WorkspaceMember[]>(`workspaces/${uuid}/members`)
  return data
}

export const removeWorkspaceMember = async (uuid: string) => {
  const { data } = await api.delete<{ success: boolean }>(`workspace-members/remove-member/${uuid}`)
  return data
}

export const fetchWorkspaceInvites = async () => {
  const { data } = await api.get<{ data: WorkspaceInvite[] }>('workspace-members/invites-for-user')
  return data.data
}

export const acceptWorkspaceInvite = async (inviteUuid: string) => {
  const { data } = await api.post<{ success: boolean }>('workspace-members/accept-invite', {
    invite: inviteUuid,
  })
  return data
}

export const rejectWorkspaceInvite = async (inviteUuid: string) => {
  const { data } = await api.post<{ success: boolean }>('workspace-members/reject-invite', {
    invite: inviteUuid,
  })
  return data
}

export const getStoredActiveWorkspace = (): Workspace | null => {
  const stored = localStorage.getItem(ACTIVE_WORKSPACE_KEY)
  if (!stored) {
    return null
  }

  try {
    return JSON.parse(stored) as Workspace
  } catch {
    localStorage.removeItem(ACTIVE_WORKSPACE_KEY)
    return null
  }
}

export const setStoredActiveWorkspace = (workspace: Workspace | null) => {
  if (!workspace) {
    localStorage.removeItem(ACTIVE_WORKSPACE_KEY)
    return
  }

  localStorage.setItem(ACTIVE_WORKSPACE_KEY, JSON.stringify(workspace))
}
