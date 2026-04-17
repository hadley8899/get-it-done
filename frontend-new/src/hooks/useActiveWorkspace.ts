import { useMemo, useSyncExternalStore } from 'react'
import { subscribeToActiveWorkspace } from '@/services/workspaceService'
import type { Workspace } from '@/types/workspace'

const ACTIVE_WORKSPACE_KEY = 'activeWorkspace'

function getActiveWorkspaceSnapshot() {
  return localStorage.getItem(ACTIVE_WORKSPACE_KEY)
}

export function useActiveWorkspace() {
  const snapshot = useSyncExternalStore(subscribeToActiveWorkspace, getActiveWorkspaceSnapshot, () => null)

  return useMemo(() => {
    if (!snapshot) {
      return null
    }

    try {
      return JSON.parse(snapshot) as Workspace
    } catch {
      localStorage.removeItem(ACTIVE_WORKSPACE_KEY)
      return null
    }
  }, [snapshot])
}
