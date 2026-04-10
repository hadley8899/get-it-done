export type LoggedInUser = {
  uuid: string
  avatar: string
  created_at: string
  email: string
  is_verified: boolean
  name: string
  permissions: string[]
}

export type LoginResponse = {
  token: string
}

export type RegisterResponse = {
  success: boolean
  data: {
    token: string
    user: {
      uuid: string
      name: string
      email: string
      avatar: string | null
      is_verified: boolean
    }
  }
}

export type UserDetailsResponse = {
  data: LoggedInUser
}

export type ForgotPasswordResponse = {
  success: boolean
}

