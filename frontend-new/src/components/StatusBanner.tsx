import { Alert, AlertTitle } from '@mui/material'
import type { ReactNode } from 'react'

export function StatusBanner({
  severity,
  title,
  children,
}: {
  severity: 'success' | 'info' | 'warning' | 'error'
  title?: string
  children: ReactNode
}) {
  return (
    <Alert severity={severity}>
      {title ? <AlertTitle>{title}</AlertTitle> : null}
      {children}
    </Alert>
  )
}
