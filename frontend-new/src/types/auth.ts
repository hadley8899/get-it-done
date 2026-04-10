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

export type UserDetailsResponse = {
  data: LoggedInUser
}
