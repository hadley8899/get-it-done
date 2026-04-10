import { api, TOKEN_KEY } from '@/api/api'
import type { ForgotPasswordResponse, LoggedInUser, LoginResponse, RegisterResponse, UserDetailsResponse } from '@/types/auth'

export const USER_STORAGE_KEY = 'userData'

export const login = async (email: string, password: string) => {
  const formData = new FormData()
  formData.append('email', email)
  formData.append('password', password)

  const { data } = await api.post<LoginResponse>('login', formData)
  return data
}

export const register = async (name: string, email: string, password: string, confirmPassword: string) => {
  const formData = new FormData()
  formData.append('name', name)
  formData.append('email', email)
  formData.append('password', password)
  formData.append('c_password', confirmPassword)

  const { data } = await api.post<RegisterResponse>('register', formData)
  return data
}

export const me = async () => {
  const { data } = await api.get<UserDetailsResponse>('user/details')
  return data.data
}

export const requestPasswordReset = async (email: string) => {
  const formData = new FormData()
  formData.append('email', email)

  const { data } = await api.post<ForgotPasswordResponse>('user/forgot-password', formData)
  return data
}

export const validatePasswordResetToken = async (token: string) => {
  const { data } = await api.get<ForgotPasswordResponse>(`user/forgot-password/find/${token}`)
  return data
}

export const resetForgottenPassword = async (email: string, token: string, password: string, passwordConfirmation: string) => {
  const formData = new FormData()
  formData.append('email', email)
  formData.append('token', token)
  formData.append('password', password)
  formData.append('password_confirmation', passwordConfirmation)

  const { data } = await api.post<ForgotPasswordResponse>('user/forgot-password/reset', formData)
  return data
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
