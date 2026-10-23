import { EMAIL_RE, TAX_RE, PHONE_RE } from "@/utils/common"
import { z } from "zod"

export const todayStr = () => {
  const d = new Date()
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 10)
}

export const createBookingSchema = (maxPerOrder: number) =>
  z
    .object({
      routeId: z.enum(["huong-tich", "long-van", "tuyet-son"]),
      date: z
        .string()
        .min(1, "Chọn ngày tham quan.")
        .refine((v) => v >= todayStr(), "Chọn ngày từ hôm nay trở đi."),
      mode: z.enum(["shared", "charter"]),
      adults: z.number().min(1, "Cần ít nhất 1 người lớn trong đơn hàng."),
      kids: z.number().min(0),
      fullName: z.string().trim().min(1, "Nhập họ tên người mua vé."),
      phone: z
        .string()
        .transform((v) => v.replace(/\s/g, ""))
        .refine(
          (v) => PHONE_RE.test(v),
          "Số điện thoại chưa đúng. Ví dụ: 0912345678."
        ),
      email: z
        .string()
        .trim()
        .refine((v) => !v || EMAIL_RE.test(v), "Email chưa đúng định dạng."),
      needInvoice: z.boolean(),
      invoice: z.object({
        taxCode: z.string().trim(),
        company: z.string().trim(),
        address: z.string().trim(),
        email: z.string().trim(),
      }),
      agree: z
        .boolean()
        .refine(
          (v) => v,
          "Bạn cần xác nhận đã đọc chính sách trước khi thanh toán."
        ),
    })
    .superRefine((v, ctx) => {
      if (v.adults + v.kids > maxPerOrder) {
        ctx.addIssue({
          code: "custom",
          path: ["kids"],
          message: `Mỗi đơn tối đa ${maxPerOrder} vé.`,
        })
      }
      if (!v.needInvoice) return
      const add = (field: keyof typeof v.invoice, message: string) =>
        ctx.addIssue({ code: "custom", path: ["invoice", field], message })
      if (!TAX_RE.test(v.invoice.taxCode))
        add("taxCode", "Mã số thuế gồm 10 hoặc 13 chữ số.")
      if (!v.invoice.company) add("company", "Nhập tên đơn vị.")
      if (!v.invoice.address) add("address", "Nhập địa chỉ.")
      if (!EMAIL_RE.test(v.invoice.email))
        add("email", "Nhập email nhận hoá đơn.")
    })
export type BookingFormValues = z.input<ReturnType<typeof createBookingSchema>>
