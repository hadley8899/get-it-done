import { Button, Card, CardActions, CardContent, Stack, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import { baseURL } from '@/api/api'
import type { Board } from '@/types/board'

export function BoardCard({ board }: { board: Board }) {
  const imageUrl = board.image
    ? (board.image.startsWith('http') ? board.image : `${baseURL.replace(/\/api$/, '')}/${board.image.replace(/^\//, '')}`)
    : null

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent
        sx={{
          p: 3,
          backgroundImage: imageUrl ? `linear-gradient(rgba(15, 22, 35, 0.45), rgba(15, 22, 35, 0.45)), url(${imageUrl})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: imageUrl ? 'common.white' : 'text.primary',
        }}
      >
        <Stack spacing={1.25}>
          <Typography variant="h3" sx={{ fontSize: '1.2rem' }}>
            {board.name}
          </Typography>
          <Typography color={imageUrl ? 'rgba(255, 255, 255, 0.85)' : 'text.secondary'}>
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
