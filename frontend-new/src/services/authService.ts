import { api, TOKEN_KEY } from '@/api/api'
import type { LoggedInUser, LoginResponse, UserDetailsResponse } from '@/types/auth'

export const USER_STORAGE_KEY = 'userData'

export const login = async (email: string, password: string) => {
  const formData = new FormData()
  formData.append('email', email)
  formData.append('password', password)

  const { data } = await api.post<LoginResponse>('login', formData)
  return data
}

export const me = async () => {
  const { data } = await api.get<UserDetailsResponse>('user/details')
  return data.data
}

export const logout = async () => {
  await api.get('user/logout')
}

export const getStoredToken = () => localStorage.getItem(TOKEN_KEY)

export const setStoredToken = (token: string) => {
  localStorage.setItem(TOKEN_KEY, token)
}

export const clearStoredToken = () => {
  localStorage.removeItem(TOKEN_KEY)
}

export const getStoredUser = (): LoggedInUser | null => {
  const stored = localStorage.getItem(USER_STORAGE_KEY)
  if (!stored) {
    return null
  }

  try {
    return JSON.parse(stored) as LoggedInUser
  } catch {
    localStorage.removeItem(USER_STORAGE_KEY)
    return null
  }
}

export const setStoredUser = (user: LoggedInUser) => {
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
}

export const clearStoredUser = () => {
  localStorage.removeItem(USER_STORAGE_KEY)
}
