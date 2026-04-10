import { Button, Card, CardActions, CardContent, Chip, Stack, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import type { Workspace } from '@/types/workspace'

export function WorkspaceCard({
  workspace,
  isActive,
  isDeleting = false,
  onSelect,
  onDelete,
}: {
  workspace: Workspace
  isActive: boolean
  isDeleting?: boolean
  onSelect: (workspace: Workspace) => void
  onDelete: (workspace: Workspace) => void
}) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 3 }}>
        <Stack spacing={1.5}>
          <Stack direction="row" spacing={1} sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Typography variant="h3" sx={{ fontSize: '1.2rem' }}>
              {workspace.name}
            </Typography>
            {isActive ? <Chip label="Active" color="success" size="small" /> : null}
          </Stack>
          <Typography color="text.secondary">{workspace.description || '(No description)'}</Typography>
          <Typography variant="body2" color="text.secondary">
            Updated: {workspace.updated_at}
          </Typography>
        </Stack>
      </CardContent>
      <CardActions sx={{ px: 3, pb: 3, pt: 0 }}>
        <Stack direction="row" spacing={1.5} useFlexGap sx={{ flexWrap: 'wrap' }}>
          <Button variant="contained" onClick={() => onSelect(workspace)} disabled={isActive || isDeleting}>
            Select
          </Button>
          <Button component={RouterLink} to={`/workspaces/update/${workspace.uuid}`} variant="outlined" disabled={isDeleting}>
            Settings
          </Button>
          <Button color="error" variant="text" onClick={() => onDelete(workspace)} disabled={isDeleting}>
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </Stack>
      </CardActions>
    </Card>
  )
}
