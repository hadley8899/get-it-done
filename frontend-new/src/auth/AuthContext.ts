import { createContext, useContext } from 'react'
import type { LoggedInUser } from '@/types/auth'

export type AuthContextValue = {
  isAuthenticated: boolean
  isInitializing: boolean
  token: string | null
  user: LoggedInUser | null
  login: (email: string, password: string) => Promise<void>
  logout: (options?: { skipRequest?: boolean }) => Promise<void>
  refreshUser: () => Promise<LoggedInUser | null>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}
