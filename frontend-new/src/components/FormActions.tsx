import { Stack } from '@mui/material'
import type { ReactNode } from 'react'

export function FormActions({ children }: { children: ReactNode }) {
  return (
    <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'flex-start', flexWrap: 'wrap' }}>
      {children}
    </Stack>
  )
}
