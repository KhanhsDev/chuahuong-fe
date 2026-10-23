"use client"

import axios from "axios"
import { mutate } from "swr"

import { AUTH_SESSION_SWR_KEY } from "@/hooks"
import { AUTH_INITIAL_STATE } from "@/hooks/useSession"

const sanitizeBody = (
  body: Record<string, unknown> | FormData | undefined
): Record<string, unknown> | FormData | undefined => {
  if (!body || body instanceof FormData) return body

  const sanitizeValue = (value: unknown): unknown => {
    if (value === null || value === undefined) return undefined

    if (typeof value === "string") return value.trim()

    if (Array.isArray(value)) {
      return value
        .map(sanitizeValue)
        .filter((v) => v !== null && v !== undefined)
    }

    if (typeof value === "object") {
      return sanitizeBody(value as Record<string, unknown>)
    }

    return value
  }

  return Object.fromEntries(
    Object.entries(body)
      .map(([key, value]) => [key, sanitizeValue(value)])
      .filter(([, value]) => value !== undefined)
  )
}

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
})

axiosInstance.interceptors.request.use((config) => {
  if (config.data && !(config.data instanceof FormData)) {
    config.data = sanitizeBody(config.data as Record<string, unknown>)
  }

  const accessToken = localStorage.getItem("accessToken")

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }

  return config
})

let isRefreshing = false

let failedQueue: Array<{
  resolve: (token: string) => void
  reject: (err: unknown) => void
}> = []

const processQueue = (error: unknown, token: string | null) => {
  failedQueue.forEach((p) => {
    if (error) {
      p.reject(error)
    } else {
      p.resolve(token!)
    }
  })

  failedQueue = []
}

axiosInstance.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config
    const status = error.response?.status

    if (status === 403) {
      return Promise.reject(error)
    }

    if (status !== 401) {
      return Promise.reject(error)
    }

    if (originalRequest?._retry) {
      return Promise.reject(error)
    }

    const refreshToken = localStorage.getItem("refreshToken")

    // Backend chưa hỗ trợ refresh token
    if (!refreshToken) {
      localStorage.removeItem("accessToken")
      mutate(AUTH_SESSION_SWR_KEY, AUTH_INITIAL_STATE, {
        revalidate: false,
      })

      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`
        return axiosInstance(originalRequest)
      })
    }

    originalRequest._retry = true
    isRefreshing = true

    try {
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh`,
        {
          refreshToken,
        }
      )

      localStorage.setItem("accessToken", data.token)
      if (data.refreshToken) {
        localStorage.setItem("refreshToken", data.refreshToken)
      }

      mutate(
        AUTH_SESSION_SWR_KEY,
        {
          accessToken: data.token,
          refreshToken: data.refreshToken ?? "",
          user: data.user,
        },
        {
          revalidate: false,
        }
      )

      processQueue(null, data.token)

      originalRequest.headers.Authorization = `Bearer ${data.token}`

      return axiosInstance(originalRequest)
    } catch (err) {
      processQueue(err, null)

      localStorage.removeItem("accessToken")
      localStorage.removeItem("refreshToken")

      mutate(AUTH_SESSION_SWR_KEY, AUTH_INITIAL_STATE, {
        revalidate: false,
      })

      return Promise.reject(err)
    } finally {
      isRefreshing = false
    }
  }
)

export default axiosInstance
