import { Button, Stack, Typography } from '@mui/material'

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  compact = false,
}: {
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
  compact?: boolean
}) {
  return (
    <Stack
      sx={{
        px: compact ? 0 : { xs: 1, md: 2 },
        py: compact ? 0.5 : { xs: 2, md: 3 },
        minHeight: compact ? 'auto' : 220,
        alignItems: 'flex-start',
        justifyContent: 'center',
      }}
      spacing={compact ? 0.5 : 2}
    >
      <Typography variant="h3" sx={compact ? { fontSize: '1rem' } : undefined}>{title}</Typography>
      <Typography color="text.secondary" sx={{ maxWidth: 560 }}>
        {description}
      </Typography>
      {actionLabel ? (
        <Button variant="contained" size={compact ? 'small' : 'medium'} onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </Stack>
  )
}
