import { Chip, Stack, Typography } from '@mui/material'
import type { ReactNode } from 'react'

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  compact = false,
}: {
  eyebrow?: string
  title: string
  description?: string
  actions?: ReactNode
  compact?: boolean
}) {
  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      spacing={compact ? 1.5 : 2.5}
      sx={{ justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: compact ? 'center' : 'flex-end' } }}
    >
      <Stack spacing={compact ? 0.75 : 1.25}>
        {eyebrow ? <Chip label={eyebrow} size={compact ? 'small' : 'medium'} color="primary" variant="outlined" sx={{ alignSelf: 'flex-start' }} /> : null}
        <Typography variant="h1" sx={{ fontSize: compact ? { xs: '1.9rem', md: '2.25rem' } : { xs: '2.3rem', md: '3rem' }, lineHeight: 1.1, maxWidth: 760 }}>
          {title}
        </Typography>
        {description ? <Typography color="text.secondary" variant={compact ? 'body2' : 'body1'} sx={{ maxWidth: 760 }}>{description}</Typography> : null}
      </Stack>
      {actions ? <Stack direction="row" spacing={compact ? 1 : 1.5} useFlexGap sx={{ flexWrap: 'wrap' }}>{actions}</Stack> : null}
    </Stack>
  )
}
