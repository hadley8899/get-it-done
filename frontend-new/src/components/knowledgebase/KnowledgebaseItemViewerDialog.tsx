import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from '@mui/material'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { KnowledgebaseItem } from '@/types/knowledgebase'

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(date)
}

export function KnowledgebaseItemViewerDialog({
  item,
  open,
  onClose,
  onEdit,
  onDelete,
}: {
  item: KnowledgebaseItem | null
  open: boolean
  onClose: () => void
  onEdit: (item: KnowledgebaseItem) => void
  onDelete: (item: KnowledgebaseItem) => void
}) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{item?.name ?? 'Knowledgebase item'}</DialogTitle>
      <DialogContent>
        {!item ? null : (
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Stack spacing={0.75}>
              <Typography variant="subtitle2">Content</Typography>
              <Stack
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  p: 2,
                  '& pre': { overflowX: 'auto' },
                }}
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{item.contents || '*No content*'}</ReactMarkdown>
              </Stack>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Created: {formatDate(item.created_at)} | Updated: {formatDate(item.updated_at)}
            </Typography>
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        {item ? (
          <Button color="error" onClick={() => onDelete(item)}>
            Delete
          </Button>
        ) : null}
        {item ? (
          <Button variant="contained" onClick={() => onEdit(item)}>
            Edit
          </Button>
        ) : null}
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  )
}
