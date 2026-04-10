import { Button, Stack, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <Stack spacing={2} sx={{ py: 10, alignItems: 'flex-start' }}>
      <Typography variant="h2">Page not found</Typography>
      <Typography color="text.secondary">The requested route does not exist in the React app yet.</Typography>
      <Button component={RouterLink} to="/dashboard" variant="contained">
        Go to dashboard
      </Button>
    </Stack>
  )
}
