"use client"

import { useEffect } from "react"
import { SWRConfig } from "swr"
import { ToastContainer } from "react-toastify"
import { fetcher } from "@/lib/fetcher"
import { restoreAuthState, setAuthState } from "@/hooks/useSession"
import axiosInstance from "@/lib/axiosInstance"
import type { ApiResponse } from "@/hooks/global"
import type { UserResponse } from "@/interface/response"

export function SWRProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const token = restoreAuthState()

    if (!token) return

    let isActive = true

    axiosInstance
      .get<ApiResponse<UserResponse>>("/api/v1/auth/me")
      .then(({ data }) => {
        if (!isActive) return

        if (!data.body) {
          throw new Error("User profile response is empty")
        }

        setAuthState({
          token: localStorage.getItem("token") ?? token,
          refreshToken: localStorage.getItem("refreshToken") ?? "",
          user: data.body,
        })
      })
      .catch((error: unknown) => {
        if (isActive) {
          console.error("Failed to restore the current user session:", error)
        }
      })

    return () => {
      isActive = false
    }
  }, [])

  return (
    <SWRConfig
      value={{
        fetcher,
        revalidateOnFocus: false,
        shouldRetryOnError: false,
      }}
    >
      {children}
      <ToastContainer position="top-right" autoClose={5000} />
    </SWRConfig>
  )
}
