"use client"

import { useState } from "react"
import { Formik, Form, Field, ErrorMessage, type FormikHelpers } from "formik"
import { loginSchema, initialLoginValues, type LoginFormValues } from "./config"
import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"

type ApiError = {
  message?: string
}

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const { login, getRedirectPath } = useAuth()
  const router = useRouter()

  const validate = (values: LoginFormValues) => {
    const result = loginSchema.safeParse(values)

    if (result.success) {
      return {}
    }

    const errors: Partial<Record<keyof LoginFormValues, string>> = {}

    result.error.issues.forEach((issue) => {
      const field = issue.path[0] as keyof LoginFormValues

      if (field && !errors[field]) {
        errors[field] = issue.message
      }
    })

    return errors
  }

  const handleSubmit = async (
    values: LoginFormValues,
    helpers: FormikHelpers<LoginFormValues>
  ) => {
    try {
      await login(values)

      const path = getRedirectPath()
      router.push(path || "/")
    } catch (error) {
      const apiError = error as ApiError

      helpers.setStatus({
        type: "error",
        message: apiError.message || "Đăng nhập thất bại. Vui lòng thử lại.",
      })
    } finally {
      helpers.setSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-[400px] rounded-2xl bg-white p-6 shadow-lg">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Đăng nhập</h1>

        <p className="mt-2 text-sm text-gray-500">
          Đăng nhập để tiếp tục đặt vé tham quan Chùa Hương.
        </p>
      </div>

      <Formik<LoginFormValues>
        initialValues={initialLoginValues}
        validate={validate}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, status, touched, errors }) => (
          <Form className="space-y-4" noValidate>
            {/* Email */}
            <div className="grid gap-1.5">
              <label
                htmlFor="email"
                className="text-sm font-medium text-gray-700"
              >
                Email
              </label>

              <Field
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="example@email.com"
                className={`h-11 w-full rounded-lg border px-3 text-sm text-gray-900 transition outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-600 ${
                  touched.email && errors.email
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
              />

              <ErrorMessage
                name="email"
                component="p"
                className="text-xs text-red-600"
              />
            </div>

            {/* Password */}
            <div className="grid gap-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-gray-700"
                >
                  Mật khẩu
                </label>

                <a
                  href="/forgot-password"
                  className="text-xs font-medium text-emerald-700 hover:underline"
                >
                  Quên mật khẩu?
                </a>
              </div>

              <div className="relative">
                <Field
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Nhập mật khẩu"
                  className={`h-11 w-full rounded-lg border px-3 pr-20 text-sm text-gray-900 transition outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-600 ${
                    touched.password && errors.password
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-3 text-xs font-medium text-gray-500 hover:text-emerald-700"
                >
                  {showPassword ? "Ẩn" : "Hiện"}
                </button>
              </div>

              <ErrorMessage
                name="password"
                component="p"
                className="text-xs text-red-600"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 inline-flex h-11 w-full items-center justify-center rounded-lg bg-emerald-700 px-4 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>

            <p className="pt-2 text-center text-sm text-gray-500">
              Chưa có tài khoản?{" "}
              <a
                href="/register"
                className="font-semibold text-emerald-700 hover:underline"
              >
                Đăng ký ngay
              </a>
            </p>
          </Form>
        )}
      </Formik>
    </div>
  )
}
