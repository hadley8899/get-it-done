import { Card, CardContent, Chip, Stack, Typography } from '@mui/material'

export function StatCard({
  label,
  value,
  tone = 'primary',
  caption,
}: {
  label: string
  value: string
  tone?: 'primary' | 'secondary' | 'success' | 'warning'
  caption?: string
}) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 3 }}>
        <Stack spacing={1.5}>
          <Chip label={label} color={tone} variant="outlined" sx={{ alignSelf: 'flex-start' }} />
          <Typography variant="h2" sx={{ fontSize: { xs: '1.9rem', md: '2.3rem' } }}>
            {value}
          </Typography>
          {caption ? <Typography color="text.secondary">{caption}</Typography> : null}
        </Stack>
      </CardContent>
    </Card>
  )
}
