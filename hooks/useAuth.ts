"use client"
import { LoginFormValues } from "@/components/LoginForm/config"
import { RegisterFormValues } from "@/components/RegisterForm/config"
import { useMutation } from "./swr"
import { METHOD } from "./global"
import { AuthState, clearAuthState, setAuthState } from "./useSession"
import _ from "lodash"
import { loginModal as globalLoginModal } from "@/hooks/useLoginModal"

import { AuthResponse } from "@/interface/response"

export function useAuth() {
  const loginMutation = useMutation<AuthResponse>("/api/v1/auth/login", {
    url: "/api/v1/auth/login",
    method: METHOD.POST,
    notification: {
      title: "Đăng nhập",
      message: "Đăng nhập thành công",
    },
    onSuccess: globalLoginModal.close,
  })

  const registerMutation = useMutation<AuthState>("/api/v1/auth/register", {
    url: "/api/v1/auth/register",
    method: METHOD.POST,
    notification: {
      title: "Đăng ký",
      message: "Đăng ký thành công",
    },
  })

  const refreshMutation = useMutation<AuthState>("/api/v1/auth/refresh", {
    url: "/api/v1/auth/refresh",
    method: METHOD.POST,
  })

  const forgotPasswordMutation = useMutation("/api/v1/auth/forgot-password", {
    url: "/api/v1/auth/forgot-password",
    method: METHOD.POST,
    notification: {
      title: "Quên mật khẩu",
      message: "Nếu email tồn tại, một liên kết đặt lại đã được gửi",
    },
  })

  const logoutMutation = useMutation("/api/v1/auth/logout", {
    url: "/api/v1/auth/logout",
    method: METHOD.POST,
    notification: {
      title: "Đăng xuất",
      message: "Bạn đã đăng xuất thành công",
    },
  })

  const resetMutation = useMutation("/api/v1/auth/reset-password", {
    url: "/api/v1/auth/reset-password",
    method: METHOD.POST,
    notification: {
      title: "Đặt lại mật khẩu",
      message: "Đặt lại mật khẩu thành công",
    },
  })

  const saveRedirectPath = (path: string) => {
    sessionStorage.setItem("auth-redirect", path)
  }

  const getRedirectPath = (): string | null => {
    const stored = sessionStorage.getItem("auth-redirect")
    sessionStorage.removeItem("auth-redirect")
    return stored
  }

  const login = async (formValues: LoginFormValues) => {
    const response = await loginMutation.trigger(formValues)

    const authData = response?.body

    if (!authData?.token || !authData?.refreshToken) {
      console.error("Login response không đúng cấu trúc:", authData)
      throw new Error("Invalid login response")
    }

    localStorage.setItem("token", authData.token)
    localStorage.setItem("refreshToken", authData.refreshToken)

    setAuthState({
      token: authData.token,
      refreshToken: authData.refreshToken,
      user: authData.user ?? null,
    })

    return authData
  }

  const register = async (formValues: RegisterFormValues) => {
    const payload = {
      email: formValues.email,
      fullName: formValues.name,
      password: formValues.password,
      phone: formValues.phone,
    }

    const response = await registerMutation.trigger(payload)
    setAuthState(response?.body)
    localStorage.setItem("refreshToken", response?.body.refreshToken)
  }

  const refresh = async (currenttoken?: string) => {
    if (currenttoken) return

    const refreshToken = localStorage.getItem("refreshToken")
    if (!refreshToken) return

    try {
      const response = await refreshMutation.trigger({ refreshToken })
      setAuthState(response?.body)
      localStorage.setItem("refreshToken", response?.body.refreshToken)
    } catch {
      localStorage.removeItem("refreshToken")
    }
  }

  //   const forgotPassword = async (formValues: EmailFormValues) => {
  //     await forgotPasswordMutation.trigger(formValues)
  //   }

  //   const verifyOtp = async (formValues: OtpFormValues) => {
  //     return await verifyOtpMutation.trigger(formValues)
  //   }

  //   const resetPassword = async (formValues: ResetFormValues) => {
  //     await resetMutation.trigger(formValues)
  //   }

  const logout = async () => {
    clearAuthState()
    try {
      const refreshToken = localStorage.getItem("refreshToken")
      await logoutMutation.trigger({ refreshToken })
    } catch {}
    localStorage.removeItem("token")
    localStorage.removeItem("refreshToken")
    sessionStorage.removeItem("auth-redirect")
  }

  return {
    login,
    register,
    refresh,
    logout,
    // verifyOtp,
    // forgotPassword,
    // resetPassword,
    saveRedirectPath,
    getRedirectPath,
  }
}
