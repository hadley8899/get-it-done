import { Card, CardContent, Stack, Typography } from '@mui/material'
import type { ReactNode } from 'react'

export function SectionCard({
  title,
  description,
  actions,
  children,
  compact = false,
}: {
  title?: string
  description?: string
  actions?: ReactNode
  children: ReactNode
  compact?: boolean
}) {
  return (
    <Card>
      <CardContent sx={{ p: compact ? { xs: 2, md: 2.5 } : { xs: 3, md: 4 } }}>
        <Stack spacing={compact ? 2 : 3}>
          {title || description || actions ? (
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={compact ? 1 : 2}
              sx={{ justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' } }}
            >
              <Stack spacing={compact ? 0.35 : 0.75}>
                {title ? <Typography variant="h3" sx={compact ? { fontSize: '1.6rem' } : undefined}>{title}</Typography> : null}
                {description ? <Typography color="text.secondary" variant={compact ? 'body2' : 'body1'}>{description}</Typography> : null}
              </Stack>
              {actions}
            </Stack>
          ) : null}
          {children}
        </Stack>
      </CardContent>
    </Card>
  )
}
