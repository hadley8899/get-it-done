export type WorkspaceOwner = {
  uuid: string
  name: string
  email: string
  avatar?: string | null
}

export type Workspace = {
  uuid: string
  name: string
  description: string
  user?: WorkspaceOwner
  created_at: string
  updated_at: string
}

export type WorkspaceMember = {
  uuid: string | null
  user: {
    uuid: string
    name: string
    email: string
    avatar?: string | null
  }
}

export type WorkspaceInvite = {
  uuid: string
  email: string
  workspace: Workspace
  user: {
    uuid: string
    name: string
    email: string
    avatar?: string | null
  }
  expires_at: string
  created_at: string
  updated_at: string
}

export type WorkspaceListResponse = {
  data: Workspace[]
}
