import { useMemo, useState, type PropsWithChildren } from 'react'
import { CssBaseline, ThemeProvider } from '@mui/material'
import { AuthProvider } from '@/auth/AuthProvider'
import { ToastProvider } from '@/components/ToastProvider'
import { ColorModeContext } from '@/theme/colorMode'
import { createAppTheme } from '@/theme/theme'

const COLOR_MODE_STORAGE_KEY = 'themeMode'

export function AppProviders({ children }: PropsWithChildren) {
  const [mode, setMode] = useState<'light' | 'dark'>(() => {
    const storedMode = localStorage.getItem(COLOR_MODE_STORAGE_KEY)
    return storedMode === 'dark' ? 'dark' : 'light'
  })

  const theme = useMemo(() => createAppTheme(mode), [mode])
  const colorMode = useMemo(
    () => ({
      mode,
      toggleMode: () => {
        setMode((currentMode) => {
          const nextMode = currentMode === 'light' ? 'dark' : 'light'
          localStorage.setItem(COLOR_MODE_STORAGE_KEY, nextMode)
          return nextMode
        })
      },
    }),
    [mode],
  )

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ToastProvider>
          <AuthProvider>{children}</AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </ColorModeContext.Provider>
  )
}
