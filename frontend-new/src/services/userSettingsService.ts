 import { api } from '@/api/api'

export const updateCurrentUser = async (payload: { name: string; email: string; avatar?: File | null }) => {
  const formData = new FormData()
  formData.append('name', payload.name)
  formData.append('email', payload.email)

  if (payload.avatar) {
    formData.append('avatar', payload.avatar)
  }

  const { data } = await api.post<{ success: boolean }>('user/update', formData)
  return data
}

export const changeCurrentUserPassword = async (payload: {
  current_password: string
  new_password: string
  new_password_repeat: string
}) => {
  const { data } = await api.post<{ success: boolean }>('user/change-password', payload)
  return data
}

