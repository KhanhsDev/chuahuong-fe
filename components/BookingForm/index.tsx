"use client"

import { useMemo } from "react"
import { Controller, useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { MAX_TICKETS_PER_ORDER, prices, routes, vnd } from "@/data/content"

const todayISO = () => {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export const schema = z
  .object({
    route: z.string().min(1, "Vui lòng chọn tuyến"),
    date: z
      .string()
      .min(1, "Vui lòng chọn ngày đi")
      .refine((v) => v >= todayISO(), "Ngày đi không được ở quá khứ"),
    adult: z.number().int().min(0),
    child: z.number().int().min(0),
    mode: z.enum(["ghep", "bao"]),
  })
  .superRefine((v, ctx) => {
    const total = v.adult + v.child
    if (total < 1) {
      ctx.addIssue({
        code: "custom",
        path: ["adult"],
        message: "Vui lòng chọn ít nhất 1 vé",
      })
    } else if (total > MAX_TICKETS_PER_ORDER) {
      ctx.addIssue({
        code: "custom",
        path: ["adult"],
        message: `Mỗi lượt mua tối đa ${MAX_TICKETS_PER_ORDER} vé. Đoàn đông hơn vui lòng tách thành nhiều đơn hàng.`,
      })
    }
  })

export type FormValues = z.infer<typeof schema>

const field =
  "w-full rounded-lg border border-black/15 bg-white px-4 py-3 text-base text-ink outline-none focus:border-jade-600 focus:ring-2 focus:ring-jade-100"

export default function BookingForm() {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      route: routes[0].id,
      date: "",
      adult: 2,
      child: 0,
      mode: "ghep",
    },
  })

  const [adult = 0, child = 0, mode] = useWatch({
    control,
    name: ["adult", "child", "mode"],
  })

  const estimate = useMemo(
    () => adult * prices.adult.weekday + child * prices.child.weekday,
    [adult, child]
  )

  async function onSubmit(values: FormValues) {
    // TODO: chuyển sang bước nhập thông tin người mua và thanh toán
    console.log(values)
  }

  return (
    <form
      id="dat-ve"
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-3xl bg-white p-6 text-ink shadow-xl sm:p-8"
    >
      <h2 className="mb-5 text-xl font-bold">Đặt vé nhanh</h2>
      <div className="space-y-4">
        <label className="block">
          <span className="mb-1 block text-sm font-semibold">
            Tuyến tham quan
          </span>
          <select className={field} {...register("route")}>
            {routes.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
          <FieldError message={errors.route?.message} />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-semibold">Ngày đi</span>
          <input
            type="date"
            min={todayISO()}
            aria-invalid={!!errors.date}
            className={field}
            {...register("date")}
          />
          <FieldError message={errors.date?.message} />
        </label>

        <div className="grid grid-cols-2 gap-4">
          <Controller
            name="adult"
            control={control}
            render={({ field: f }) => (
              <Counter
                label="Người lớn"
                value={f.value}
                onChange={f.onChange}
              />
            )}
          />
          <Controller
            name="child"
            control={control}
            render={({ field: f }) => (
              <Counter label="Trẻ em" value={f.value} onChange={f.onChange} />
            )}
          />
        </div>
        <FieldError message={errors.adult?.message ?? errors.child?.message} />

        <fieldset>
          <legend className="mb-1 text-sm font-semibold">
            Hình thức đi đò
          </legend>
          <Controller
            name="mode"
            control={control}
            render={({ field: f }) => (
              <div className="grid grid-cols-2 gap-3">
                {(
                  [
                    ["ghep", "Ghép đò"],
                    ["bao", "Bao thuyền"],
                  ] as const
                ).map(([v, l]) => (
                  <button
                    type="button"
                    key={v}
                    onClick={() => f.onChange(v)}
                    className={`rounded-lg border px-4 py-3 text-sm font-semibold ${
                      f.value === v
                        ? "border-jade-600 bg-jade-50 text-jade-700"
                        : "border-black/15 hover:bg-black/5"
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            )}
          />
          {mode === "bao" && (
            <p className="mt-2 text-xs text-ink/60">
              Bao thuyền được cộng thêm phụ phí theo quy định của Ban Quản lý.
            </p>
          )}
        </fieldset>

        <div className="flex items-end justify-between border-t border-black/10 pt-4">
          <span className="text-sm text-ink/60">
            Tạm tính (giá ngày thường)
          </span>
          <strong className="text-2xl text-brand-600">{vnd(estimate)}</strong>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-full bg-brand-600 py-3.5 text-base font-bold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Tiếp tục thanh toán
        </button>
        <p className="text-center text-xs text-ink/50">
          Giá cuối cùng áp dụng theo bảng giá của ngày bạn chọn.
        </p>
      </div>
    </form>
  )
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <p
      role="alert"
      className="mt-1 rounded-lg bg-brand-50 p-3 text-sm text-brand-700"
    >
      {message}
    </p>
  )
}

function Counter({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (n: number) => void
}) {
  return (
    <div>
      <span className="mb-1 block text-sm font-semibold">{label}</span>
      <div className="flex items-center justify-between rounded-lg border border-black/15 px-2 py-1.5">
        <button
          type="button"
          aria-label={`Giảm ${label}`}
          onClick={() => onChange(Math.max(0, value - 1))}
          className="size-9 rounded-md text-xl hover:bg-black/5"
        >
          −
        </button>
        <span className="font-bold">{value}</span>
        <button
          type="button"
          aria-label={`Tăng ${label}`}
          onClick={() => onChange(value + 1)}
          className="size-9 rounded-md text-xl hover:bg-black/5"
        >
          +
        </button>
      </div>
    </div>
  )
}
