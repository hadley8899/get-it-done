import { Button, Card, CardActions, CardContent, Stack, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import type { Board } from '@/types/board'

export function BoardCard({ board }: { board: Board }) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 3 }}>
        <Stack spacing={1.25}>
          <Typography variant="h3" sx={{ fontSize: '1.2rem' }}>
            {board.name}
          </Typography>
          <Typography color="text.secondary">
            {board.description || 'No description'}
          </Typography>
        </Stack>
      </CardContent>
      <CardActions sx={{ px: 3, pb: 3, pt: 0 }}>
        <Button component={RouterLink} to={`/boards/${board.uuid}`} variant="contained">
          Open board
        </Button>
      </CardActions>
    </Card>
  )
}
