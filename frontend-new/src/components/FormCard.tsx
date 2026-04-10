import { Card, CardContent, Stack, Typography } from '@mui/material'
import type { ReactNode } from 'react'

export function FormCard({
  title,
  description,
  footer,
  children,
}: {
  title: string
  description?: string
  footer?: ReactNode
  children: ReactNode
}) {
  return (
    <Card sx={{ width: '100%', maxWidth: 560 }}>
      <CardContent sx={{ p: { xs: 3, md: 5 } }}>
        <Stack spacing={3}>
          <Stack spacing={1}>
            <Typography variant="h3">{title}</Typography>
            {description ? <Typography color="text.secondary">{description}</Typography> : null}
          </Stack>
          {children}
          {footer}
        </Stack>
      </CardContent>
    </Card>
  )
}
