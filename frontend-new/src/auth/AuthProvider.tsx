import { useCallback, useEffect, useMemo, useState } from 'react'
import type { PropsWithChildren } from 'react'
import { UNAUTHORIZED_EVENT } from '@/api/api'
import { AuthContext } from '@/auth/AuthContext'
import {
  clearStoredToken,
  clearStoredUser,
  getStoredToken,
  getStoredUser,
  login as loginRequest,
  logout as logoutRequest,
  me,
  setStoredToken,
  setStoredUser,
} from '@/services/authService'
import { notifyError, notifySuccess } from '@/services/toastService'

export function AuthProvider({ children }: PropsWithChildren) {
  const [token, setToken] = useState<string | null>(() => getStoredToken())
  const [user, setUser] = useState(() => getStoredUser())
  const [isInitializing, setIsInitializing] = useState(true)

  const clearSession = useCallback(async (options?: { skipRequest?: boolean }) => {
    if (!options?.skipRequest && token) {
      try {
        await logoutRequest()
      } catch {
        // best effort
      }
    }

    clearStoredToken()
    clearStoredUser()
    setToken(null)
    setUser(null)
  }, [token])

  const refreshUser = useCallback(async () => {
    if (!getStoredToken()) {
      return null
    }

    const currentUser = await me()
    setStoredUser(currentUser)
    setUser(currentUser)
    return currentUser
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const response = await loginRequest(email, password)
    setStoredToken(response.token)
    setToken(response.token)
    await refreshUser()
    notifySuccess('Logged in successfully.')
  }, [refreshUser])

  const logout = useCallback(async (options?: { skipRequest?: boolean }) => {
    await clearSession(options)
  }, [clearSession])

  useEffect(() => {
    const handleUnauthorized = () => {
      void clearSession({ skipRequest: true })
      notifyError('Your session has expired. Please log in again.')
    }

    window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized)
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized)
  }, [clearSession])

  useEffect(() => {
    let isMounted = true

    async function bootstrap() {
      if (!token) {
        setIsInitializing(false)
        return
      }

      try {
        await refreshUser()
      } catch {
        await clearSession({ skipRequest: true })
      } finally {
        if (isMounted) {
          setIsInitializing(false)
        }
      }
    }

    void bootstrap()

    return () => {
      isMounted = false
    }
  }, [clearSession, refreshUser, token])

  const value = useMemo(
    () => ({
      isAuthenticated: Boolean(token),
      isInitializing,
      token,
      user,
      login,
      logout,
      refreshUser,
    }),
    [isInitializing, login, logout, refreshUser, token, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
