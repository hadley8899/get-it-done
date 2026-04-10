import { Button, Card, CardActions, CardContent, CardHeader, Stack, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import type { KnowledgebaseCategory } from '@/types/knowledgebase'

export function KnowledgebaseCategoryCard({
  category,
  onDelete,
  isDeleting = false,
}: {
  category: KnowledgebaseCategory
  onDelete: (category: KnowledgebaseCategory) => void
  isDeleting?: boolean
}) {
  return (
    <Card sx={{ height: '100%', borderRadius: 2 }}>
      <CardHeader
        title={category.name}
        slotProps={{
          title: {
            variant: 'h3',
            sx: { fontSize: '1rem', fontWeight: 700 },
          },
        }}
        sx={{ pb: 0.5 }}
      />
      <CardContent sx={{ px: 2, pb: 1.5 }}>
        <Stack spacing={1}>
          <Typography color="text.secondary">
            {category.description || '(No description)'}
          </Typography>
        </Stack>
      </CardContent>
      <CardActions sx={{ px: 2, pb: 2, pt: 0 }}>
        <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
          <Button component={RouterLink} to={`/knowledgebase/category/${category.uuid}`} variant="contained" size="small">
            Select
          </Button>
          <Button component={RouterLink} to={`/knowledgebase/category/update/${category.uuid}`} variant="outlined" size="small">
            Update
          </Button>
          <Button color="error" onClick={() => onDelete(category)} disabled={isDeleting} size="small">
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </Stack>
      </CardActions>
    </Card>
  )
}
