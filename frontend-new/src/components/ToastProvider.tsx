import { Alert, Snackbar } from '@mui/material'
import { useCallback, useEffect, useReducer } from 'react'
import type { ReactNode } from 'react'
import { registerToastHandler } from '@/services/toastService'

type ToastItem = {
  message: string
  severity: 'error' | 'success' | 'info' | 'warning'
  duration: number
}

type ToastState = {
  queue: ToastItem[]
  current: ToastItem | null
  open: boolean
}

type ToastAction =
  | { type: 'enqueue'; toast: ToastItem }
  | { type: 'close' }
  | { type: 'exited' }

const defaultDuration = 4800

function toastReducer(state: ToastState, action: ToastAction): ToastState {
  switch (action.type) {
    case 'enqueue':
      if (!state.current && !state.open) {
        return { ...state, current: action.toast, open: true }
      }

      return { ...state, queue: [...state.queue, action.toast] }
    case 'close':
      return { ...state, open: false }
    case 'exited': {
      if (state.queue.length === 0) {
        return { ...state, current: null, open: false }
      }

      const [next, ...rest] = state.queue
      return { queue: rest, current: next, open: true }
    }
    default:
      return state
  }
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(toastReducer, {
    queue: [],
    current: null,
    open: false,
  })

  const pushToast = useCallback(
    (toast: ToastItem) => {
      dispatch({ type: 'enqueue', toast })
    },
    [],
  )

  useEffect(() => {
    registerToastHandler((payload) => {
      pushToast({
        message: payload.message,
        severity: payload.severity ?? 'info',
        duration: payload.duration ?? defaultDuration,
      })
    })

    return () => registerToastHandler(null)
  }, [pushToast])

  return (
    <>
      {children}
      <Snackbar
        open={state.open}
        autoHideDuration={state.current?.duration ?? defaultDuration}
        onClose={() => dispatch({ type: 'close' })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          transition: {
            onExited: () => dispatch({ type: 'exited' }),
          },
        }}
      >
        <Alert
          severity={state.current?.severity ?? 'info'}
          onClose={() => dispatch({ type: 'close' })}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {state.current?.message ?? ''}
        </Alert>
      </Snackbar>
    </>
  )
}
