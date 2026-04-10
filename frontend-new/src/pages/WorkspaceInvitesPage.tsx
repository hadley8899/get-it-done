import { Stack } from '@mui/material'
import { useEffect, useState } from 'react'
import { EmptyState } from '@/components/EmptyState'
import { PageHeader } from '@/components/PageHeader'
import { SectionCard } from '@/components/SectionCard'
import { WorkspaceInvitesTable } from '@/components/workspaces/WorkspaceInvitesTable'
import { notifyError, notifySuccess } from '@/services/toastService'
import { acceptWorkspaceInvite, fetchWorkspaceInvites, rejectWorkspaceInvite } from '@/services/workspaceService'
import type { WorkspaceInvite } from '@/types/workspace'

export function WorkspaceInvitesPage() {
  const [invites, setInvites] = useState<WorkspaceInvite[]>([])
  const [loading, setLoading] = useState(true)
  const [pendingInviteUuid, setPendingInviteUuid] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function loadInvites() {
      try {
        const inviteData = await fetchWorkspaceInvites()
        if (isMounted) {
          setInvites(inviteData)
        }
      } catch {
        notifyError('Failed to load workspace invites.')
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    void loadInvites()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <Stack spacing={3}>
      <PageHeader
        eyebrow="Workspaces"
        title="Workspace invites"
        description="Review and respond to pending workspace invitations using the existing Laravel invite endpoints."
      />
      <SectionCard title="Pending invites" description="Accepting an invite should make the workspace available in your list after refresh.">
        {loading ? (
          <EmptyState title="Loading invites" description="Fetching pending workspace invites from the API." />
        ) : invites.length === 0 ? (
          <EmptyState title="No pending invites" description="You do not have any workspace invites at the moment." />
        ) : (
          <WorkspaceInvitesTable
            invites={invites}
            pendingInviteUuid={pendingInviteUuid}
            onAccept={async (inviteUuid) => {
              setPendingInviteUuid(inviteUuid)
              try {
                await acceptWorkspaceInvite(inviteUuid)
                setInvites((current) => current.filter((invite) => invite.uuid !== inviteUuid))
                notifySuccess('Invite accepted successfully.')
              } catch {
                notifyError('Failed to accept the invite.')
              } finally {
                setPendingInviteUuid(null)
              }
            }}
            onReject={async (inviteUuid) => {
              setPendingInviteUuid(inviteUuid)
              try {
                await rejectWorkspaceInvite(inviteUuid)
                setInvites((current) => current.filter((invite) => invite.uuid !== inviteUuid))
                notifySuccess('Invite rejected successfully.')
              } catch {
                notifyError('Failed to reject the invite.')
              } finally {
                setPendingInviteUuid(null)
              }
            }}
          />
        )}
      </SectionCard>
    </Stack>
  )
}
