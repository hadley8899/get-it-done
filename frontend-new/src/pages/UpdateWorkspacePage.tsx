import { Stack } from '@mui/material'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { EmptyState } from '@/components/EmptyState'
import { FormCard } from '@/components/FormCard'
import { PageHeader } from '@/components/PageHeader'
import { SectionCard } from '@/components/SectionCard'
import { WorkspaceMembersPanel } from '@/components/workspaces/WorkspaceMembersPanel'
import { WorkspaceForm } from '@/components/workspaces/WorkspaceForm'
import { notifyError, notifySuccess } from '@/services/toastService'
import {
  fetchWorkspace,
  fetchWorkspaceMembers,
  getStoredActiveWorkspace,
  removeWorkspaceMember,
  setStoredActiveWorkspace,
  updateWorkspace,
} from '@/services/workspaceService'
import type { Workspace, WorkspaceMember } from '@/types/workspace'

export function UpdateWorkspacePage() {
  const { uuid = '' } = useParams()
  const navigate = useNavigate()
  const [workspace, setWorkspace] = useState<Workspace | null>(null)
  const [members, setMembers] = useState<WorkspaceMember[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [removingMemberUuid, setRemovingMemberUuid] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function loadPage() {
      try {
        const [workspaceData, membersData] = await Promise.all([fetchWorkspace(uuid), fetchWorkspaceMembers(uuid)])

        if (!isMounted) {
          return
        }

        setWorkspace(workspaceData)
        setMembers(membersData)
      } catch {
        notifyError('Failed to load the workspace.')
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    void loadPage()

    return () => {
      isMounted = false
    }
  }, [uuid])

  if (loading) {
    return <EmptyState title="Loading workspace" description="Fetching workspace details and members from the API." />
  }

  if (!workspace) {
    return <EmptyState title="Workspace not found" description="The requested workspace could not be loaded." />
  }

  return (
    <Stack spacing={3}>
      <PageHeader
        eyebrow="Workspaces"
        title={`Update ${workspace.name}`}
        description="Edit workspace details and manage existing members using the current Laravel endpoints."
      />
      <FormCard title="Workspace settings" description="Update the workspace name and description.">
        <WorkspaceForm
          defaultValues={{ name: workspace.name, description: workspace.description }}
          submitLabel="Save workspace"
          isSubmitting={saving}
          onSubmit={async (values) => {
            setSaving(true)
            try {
              const updatedWorkspace = await updateWorkspace(uuid, values)
              setWorkspace(updatedWorkspace)

              const activeWorkspace = getStoredActiveWorkspace()
              if (activeWorkspace?.uuid === updatedWorkspace.uuid) {
                setStoredActiveWorkspace(updatedWorkspace)
              }

              notifySuccess('Workspace updated successfully.')
              navigate('/workspaces')
            } catch {
              notifyError('Failed to update the workspace.')
            } finally {
              setSaving(false)
            }
          }}
        />
      </FormCard>
      <SectionCard title="Workspace members" description="The owner record is read-only. Other members can be removed.">
        <WorkspaceMembersPanel
          members={members}
          removingMemberUuid={removingMemberUuid}
          onRemove={async (memberUuid) => {
            setRemovingMemberUuid(memberUuid)
            try {
              await removeWorkspaceMember(memberUuid)
              setMembers((current) => current.filter((member) => member.uuid !== memberUuid))
              notifySuccess('Member removed successfully.')
            } catch {
              notifyError('Failed to remove the member.')
            } finally {
              setRemovingMemberUuid(null)
            }
          }}
        />
      </SectionCard>
    </Stack>
  )
}
