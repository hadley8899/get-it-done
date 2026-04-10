import {
  Link,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import type { KnowledgebaseItem } from '@/types/knowledgebase'

function truncateContents(value: string, maxLength = 80) {
  if (value.length <= maxLength) {
    return value
  }

  return `${value.slice(0, maxLength).trimEnd()}...`
}

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

export function KnowledgebaseItemsTable({
  items,
  onSelect,
}: {
  items: KnowledgebaseItem[]
  onSelect: (item: KnowledgebaseItem) => void
}) {
  return (
    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Content</TableCell>
            <TableCell sx={{ fontWeight: 700, width: 180 }}>Created</TableCell>
            <TableCell sx={{ fontWeight: 700, width: 180 }}>Updated</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.uuid} hover>
              <TableCell>
                <Link
                  component="button"
                  type="button"
                  underline="hover"
                  onClick={() => onSelect(item)}
                  sx={{ fontWeight: 500, textAlign: 'left' }}
                >
                  {item.name}
                </Link>
              </TableCell>
              <TableCell>
                <Typography variant="body2" color="text.secondary">
                  {truncateContents(item.contents)}
                </Typography>
              </TableCell>
              <TableCell>{formatDate(item.created_at)}</TableCell>
              <TableCell>{formatDate(item.updated_at)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
