import { Button, Paper, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material'
import type { WorkspaceInvite } from '@/types/workspace'

export function WorkspaceInvitesTable({
  invites,
  pendingInviteUuid = null,
  onAccept,
  onReject,
}: {
  invites: WorkspaceInvite[]
  pendingInviteUuid?: string | null
  onAccept: (inviteUuid: string) => void
  onReject: (inviteUuid: string) => void
}) {
  return (
    <Paper variant="outlined" sx={{ overflowX: 'auto' }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Workspace</TableCell>
            <TableCell>Invited By</TableCell>
            <TableCell>Invited On</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {invites.map((invite) => {
            const isPending = pendingInviteUuid === invite.uuid

            return (
              <TableRow key={invite.uuid} hover>
                <TableCell>
                  <Typography sx={{ fontWeight: 600 }}>{invite.workspace.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {invite.workspace.description}
                  </Typography>
                </TableCell>
                <TableCell>{invite.user.name}</TableCell>
                <TableCell>{invite.created_at}</TableCell>
                <TableCell align="right">
                  <Button variant="contained" size="small" sx={{ mr: 1 }} disabled={isPending} onClick={() => onAccept(invite.uuid)}>
                    Accept
                  </Button>
                  <Button variant="text" color="error" size="small" disabled={isPending} onClick={() => onReject(invite.uuid)}>
                    Reject
                  </Button>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </Paper>
  )
}
