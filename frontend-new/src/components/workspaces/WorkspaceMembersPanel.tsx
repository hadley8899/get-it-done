import { Avatar, Button, List, ListItem, ListItemAvatar, ListItemText, Stack, Typography } from '@mui/material'
import type { WorkspaceMember } from '@/types/workspace'

export function WorkspaceMembersPanel({
  members,
  onRemove,
  removingMemberUuid = null,
}: {
  members: WorkspaceMember[]
  onRemove: (memberUuid: string) => void
  removingMemberUuid?: string | null
}) {
  return (
    <List disablePadding>
      {members.map((member) => {
        const isOwner = member.uuid === null
        const initials = member.user.name.charAt(0).toUpperCase()

        return (
          <ListItem
            key={member.uuid ?? `owner-${member.user.uuid}`}
            disableGutters
            secondaryAction={
              isOwner ? (
                <Typography variant="body2" color="text.secondary">
                  Owner
                </Typography>
              ) : (
                <Button color="error" onClick={() => onRemove(member.uuid!)} disabled={removingMemberUuid === member.uuid}>
                  {removingMemberUuid === member.uuid ? 'Removing...' : 'Remove'}
                </Button>
              )
            }
            sx={{ py: 1.25 }}
          >
            <ListItemAvatar>
              <Avatar>{initials}</Avatar>
            </ListItemAvatar>
            <ListItemText primary={member.user.name} secondary={member.user.email} />
          </ListItem>
        )
      })}
      {members.length === 0 ? (
        <Stack sx={{ py: 3 }}>
          <Typography color="text.secondary">No members found for this workspace.</Typography>
        </Stack>
      ) : null}
    </List>
  )
}
