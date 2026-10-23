import { z } from "zod"

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập email")
    .email("Email không hợp lệ"),

  password: z
    .string()
    .min(1, "Vui lòng nhập mật khẩu")
    .min(8, "Mật khẩu phải có ít nhất 8 ký tự"),
})

export type LoginFormValues = z.infer<typeof loginSchema>

export const initialLoginValues: LoginFormValues = {
  email: "",
  password: "",
}
