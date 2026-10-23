import { GENDER, ROLE_NAME, USER_STATUS } from "@/common"

export type BaseEntityResponse = {
  id: string
  createdAt?: string
  updatedAt?: string | null
  deletedAt?: string | null
  deleted?: boolean
}

export type UserResponse = BaseEntityResponse & {
  id: number
  username: string
  email: string
  fullName: string
  phone: string
  role: ROLE_NAME
  gender: GENDER
  dateOfBirth: string
  status: USER_STATUS
  pathAvatar: string
  emailVerified: boolean
  phoneVerified: boolean
}

export type LandingServicePromotionResponse = Record<string, string[]>

export interface ServicePromotionInput {
  id: string
  name: string
  description: string
}

export type AuthResponse = {
  token: string
  refreshToken: string
  user?: UserResponse | null
}
