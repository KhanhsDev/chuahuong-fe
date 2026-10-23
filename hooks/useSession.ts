"use client"
import { UserResponse } from "@/interface/response"
import useSWR, { mutate } from "swr"
import { AUTH_SESSION_SWR_KEY } from "./index"

export type AuthState = {
  token: string
  refreshToken: string
  user: UserResponse | null
}

export const AUTH_INITIAL_STATE: AuthState = {
  token: "",
  refreshToken: "",
  user: null,
}
export function setAuthState(state: AuthState) {
  mutate(AUTH_SESSION_SWR_KEY, state, {
    revalidate: false,
  })
}

export function clearAuthState() {
  mutate(AUTH_SESSION_SWR_KEY, AUTH_INITIAL_STATE, {
    revalidate: false,
  })
}

export function useSession() {
  const { data = AUTH_INITIAL_STATE } = useSWR<AuthState>(
    AUTH_SESSION_SWR_KEY,
    null,
    {
      fallbackData: AUTH_INITIAL_STATE,
    }
  )

  const token = data?.token

  return {
    token,
    refreshToken: data.refreshToken,
    isAuthenticated: !!data.token,
  }
}
