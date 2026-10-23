"use client"

import {
  BoatMode,
  BookingFormProps,
  DayPrice,
  RouteId,
} from "@/interface/common"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { BookingFormValues, createBookingSchema, todayStr } from "./config"
import Stepper from "../Stepper"
import { useSearchParams } from "next/navigation"
import { testAPI } from "./hooks"
const ROUTES: { id: RouteId; name: string; path: string; duration: string }[] =
  [
    {
      id: "huong-tich",
      name: "Hương Tích",
      path: "Bến Yến → Đền Trình → Thiên Trù → Động Hương Tích",
      duration: "60–70 phút",
    },
    {
      id: "long-van",
      name: "Long Vân",
      path: "Bến Yến → Chùa và động Long Vân",
      duration: "30–35 phút",
    },
    {
      id: "tuyet-son",
      name: "Tuyết Sơn",
      path: "Bến đò Tuyết Sơn → Chùa Bảo Đài, động Tuyết Sơn",
      duration: "30–35 phút",
    },
  ]
const defaultGetPrice = (): DayPrice => ({ adult: 110000, child: 65000 })
const defaultCharterFee = () => 0

const vnd = (n: number) => n.toLocaleString("vi-VN") + "đ"

const fmtDate = (s: string) => (s ? s.split("-").reverse().join("/") : "")

/* ---------- Component ---------- */

export default function BookingForm({
  getPrice = defaultGetPrice,
  getCharterFee = defaultCharterFee,
  maxPerOrder = 15,
  onSubmit,
}: BookingFormProps) {
  const { getListUsers } = testAPI()
  const schema = useMemo(() => createBookingSchema(maxPerOrder), [maxPerOrder])
  const [submitError, setSubmitError] = useState("")
  const searchParams = useSearchParams()
  const routeParam = searchParams.get("route") as RouteId | null
  const dateParam = searchParams.get("date")
  const adultsParam = searchParams.get("adult")
  const childsParam = searchParams.get("child")
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      routeId: routeParam || "huong-tich",
      date: dateParam || todayStr(),
      mode: "shared",
      adults: adultsParam ? parseInt(adultsParam, 10) : 1,
      kids: childsParam ? parseInt(childsParam, 10) : 0,
      fullName: "",
      phone: "",
      email: "",
      needInvoice: false,
      invoice: { taxCode: "", company: "", address: "", email: "" },
      agree: false,
    },
  })
  const respose = getListUsers
  console.log("check res", respose.data)
  const routeId = watch("routeId") as RouteId
  const date = watch("date")
  const mode = watch("mode") as BoatMode
  const adults = watch("adults")
  const kids = watch("kids")
  const needInvoice = watch("needInvoice")

  const route = ROUTES.find((r) => r.id === routeId)!
  const price = useMemo(() => getPrice(date), [getPrice, date])
  const charterFee = mode === "charter" ? getCharterFee(date) : 0
  const qty = adults + kids
  const total = adults * price.adult + kids * price.child + charterFee
  const canAdd = qty < maxPerOrder

  const setCount = (name: "adults" | "kids", v: number) =>
    setValue(name, v, { shouldDirty: true, shouldValidate: true })

  const submit = handleSubmit(async (v) => {
    setSubmitError("")
    try {
      await onSubmit?.({
        routeId: v.routeId,
        date: v.date,
        mode: v.mode,
        adults: v.adults,
        children: v.kids,
        buyer: {
          fullName: v.fullName.trim(),
          phone: v.phone.replace(/\s/g, ""),
          email: v.email.trim() || undefined,
        },
        invoice: v.needInvoice ? { ...v.invoice } : null,
        total,
      })
    } catch {
      setSubmitError("Chưa tạo được đơn hàng. Kiểm tra kết nối và thử lại.")
    }
  })

  const qtyError = errors.adults?.message ?? errors.kids?.message

  return (
    <form
      noValidate
      onSubmit={submit}
      className="mx-auto grid max-w-[104rem] gap-[2.4rem] bg-[#f3f6f4] p-[1.6rem] text-[#17302b] lg:grid-cols-[1fr_36rem] lg:p-[2.4rem]"
    >
      <div className="flex flex-col gap-[1.6rem]">
        <div className="rounded-[1.2rem] bg-[#dcebe6] px-[1.6rem] py-[1.2rem] text-[1.4rem] text-[#1e4b43]">
          Không cần tạo tài khoản. Chỉ cần họ tên và số điện thoại. Số điện
          thoại dùng để check-in tại bến và nhận thông báo.
        </div>

        {/* 1. Hành trình */}
        <section
          className="rounded-[1.2rem] border border-[#d7e2de] bg-white p-[2rem]"
          id="sec-trip"
        >
          <h2
            id="sec-trip"
            className="mb-[1.6rem] text-[1.8rem] font-bold text-[#17302b]"
          >
            Chọn hành trình
          </h2>

          <fieldset>
            <legend className="mb-[0.6rem] block text-[1.3rem] font-semibold text-[#3b564f]">
              Tuyến tham quan
            </legend>
            <div className="grid gap-[1rem]">
              {ROUTES.map((r) => (
                <label
                  key={r.id}
                  className={`flex cursor-pointer items-start gap-[1.2rem] rounded-[0.8rem] border p-[1.4rem] transition-colors ${
                    routeId === r.id
                      ? "border-[#1e4b43] bg-[#eaf3f0]"
                      : "border-[#d7e2de] hover:bg-[#f6faf8]"
                  }`}
                >
                  <input
                    type="radio"
                    value={r.id}
                    className="mt-[0.4rem] accent-[#1e4b43]"
                    {...register("routeId")}
                  />
                  <span className="flex-1">
                    <span className="block text-[1.6rem] font-bold">
                      {r.name}
                    </span>
                    <span className="block text-[1.3rem] text-[#52695f]">
                      {r.path}
                    </span>
                  </span>
                  <span className="text-[1.3rem] whitespace-nowrap text-[#52695f]">
                    {r.duration}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="mt-[2rem]">
            <label
              htmlFor="date"
              className="mb-[0.6rem] block text-[1.3rem] font-semibold text-[#3b564f]"
            >
              Ngày tham quan
            </label>
            <input
              id="date"
              type="date"
              min={todayStr()}
              className="w-full max-w-[22rem] rounded-[0.8rem] border border-[#c9d6d1] bg-white px-[1.4rem] py-[1.1rem] text-[1.5rem] text-[#17302b] placeholder:text-[#8aa098] focus:border-[#1e4b43] focus:ring-2 focus:ring-[#1e4b43]/25 focus:outline-none"
              {...register("date")}
            />
            {errors.date && (
              <p className="mt-[0.5rem] text-[1.2rem] text-[#b3261e]">
                {errors.date.message}
              </p>
            )}
          </div>

          <fieldset className="mt-[2rem]">
            <legend className="mb-[0.6rem] block text-[1.3rem] font-semibold text-[#3b564f]">
              Hình thức đi đò
            </legend>
            <div className="grid gap-[1rem] sm:grid-cols-2">
              {(
                [
                  {
                    id: "shared",
                    title: "Ghép đò",
                    desc: "Hệ thống xếp bạn cùng đò với khách khác khi check-in.",
                  },
                  {
                    id: "charter",
                    title: "Bao thuyền",
                    desc: "Cả đò dành riêng cho nhóm bạn, không ghép thêm khách.",
                  },
                ] as const
              ).map((m) => (
                <label
                  key={m.id}
                  className={`flex cursor-pointer gap-[1.2rem] rounded-[0.8rem] border p-[1.4rem] ${
                    mode === m.id
                      ? "border-[#1e4b43] bg-[#eaf3f0]"
                      : "border-[#d7e2de] hover:bg-[#f6faf8]"
                  }`}
                >
                  <input
                    type="radio"
                    value={m.id}
                    className="mt-[0.4rem] accent-[#1e4b43]"
                    {...register("mode")}
                  />
                  <span>
                    <span className="block text-[1.5rem] font-bold">
                      {m.title}
                      {m.id === "charter" && getCharterFee(date) > 0 && (
                        <span className="ml-[0.6rem] text-[1.3rem] font-semibold text-[#a6324f]">
                          +{vnd(getCharterFee(date))}
                        </span>
                      )}
                    </span>
                    <span className="block text-[1.3rem] text-[#52695f]">
                      {m.desc}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="mt-[2rem]">
            <span className="mb-[0.6rem] block text-[1.3rem] font-semibold text-[#3b564f]">
              Số khách (tối đa {maxPerOrder} vé mỗi đơn)
            </span>
            <div className="divide-y divide-[#e4ece9] rounded-[0.8rem] border border-[#d7e2de] px-[1.4rem]">
              <div className="flex items-center justify-between py-[1.2rem]">
                <div>
                  <div className="text-[1.5rem] font-semibold">Người lớn</div>
                  <div className="text-[1.3rem] text-[#a6324f]">
                    {vnd(price.adult)}/khách
                  </div>
                </div>
                <Stepper
                  name="người lớn"
                  value={adults}
                  min={1}
                  onChange={(v) => setCount("adults", v)}
                  canIncrease={canAdd}
                />
              </div>
              <div className="flex items-center justify-between py-[1.2rem]">
                <div>
                  <div className="text-[1.5rem] font-semibold">Trẻ em</div>
                  <div className="text-[1.3rem] text-[#a6324f]">
                    {vnd(price.child)}/khách
                  </div>
                </div>
                <Stepper
                  name="trẻ em"
                  value={kids}
                  onChange={(v) => setCount("kids", v)}
                  canIncrease={canAdd}
                />
              </div>
            </div>
            {qtyError && (
              <p className="mt-[0.5rem] text-[1.2rem] text-[#b3261e]">
                {qtyError}
              </p>
            )}
            <p className="mt-[0.8rem] text-[1.2rem] text-[#52695f]">
              {qty >= maxPerOrder
                ? `Đã đủ ${maxPerOrder} vé. Đoàn đông hơn vui lòng đặt thêm đơn với số điện thoại của người đại diện khác.`
                : "Người lái đò có thể đối chiếu độ tuổi trẻ em khi quét vé lên đò."}
            </p>
          </div>
        </section>

        {/* 2. Thông tin người mua */}
        <section
          className="rounded-[1.2rem] border border-[#d7e2de] bg-white p-[2rem]"
          id="sec-buyer"
        >
          <h2
            id="sec-buyer"
            className="mb-[1.6rem] text-[1.8rem] font-bold text-[#17302b]"
          >
            Thông tin người mua
          </h2>
          <div className="grid gap-[1.6rem] sm:grid-cols-2">
            <div>
              <label
                htmlFor="fullName"
                className="mb-[0.6rem] block text-[1.3rem] font-semibold text-[#3b564f]"
              >
                Họ và tên *
              </label>
              <input
                id="fullName"
                autoComplete="name"
                className="w-full rounded-[0.8rem] border border-[#c9d6d1] bg-white px-[1.4rem] py-[1.1rem] text-[1.5rem] text-[#17302b] placeholder:text-[#8aa098] focus:border-[#1e4b43] focus:ring-2 focus:ring-[#1e4b43]/25 focus:outline-none"
                placeholder="Nguyễn Văn A"
                aria-invalid={!!errors.fullName}
                {...register("fullName")}
              />
              {errors.fullName && (
                <p className="mt-[0.5rem] text-[1.2rem] text-[#b3261e]">
                  {errors.fullName.message}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="phone"
                className="mb-[0.6rem] block text-[1.3rem] font-semibold text-[#3b564f]"
              >
                Số điện thoại *
              </label>
              <input
                id="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                className="w-full rounded-[0.8rem] border border-[#c9d6d1] bg-white px-[1.4rem] py-[1.1rem] text-[1.5rem] text-[#17302b] placeholder:text-[#8aa098] focus:border-[#1e4b43] focus:ring-2 focus:ring-[#1e4b43]/25 focus:outline-none"
                placeholder="0912 345 678"
                aria-invalid={!!errors.phone}
                {...register("phone")}
              />
              {errors.phone && (
                <p className="mt-[0.5rem] text-[1.2rem] text-[#b3261e]">
                  {errors.phone.message}
                </p>
              )}
            </div>
            <div className="sm:col-span-2">
              <label
                htmlFor="email"
                className="mb-[0.6rem] block text-[1.3rem] font-semibold text-[#3b564f]"
              >
                Email (không bắt buộc)
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                className="w-full rounded-[0.8rem] border border-[#c9d6d1] bg-white px-[1.4rem] py-[1.1rem] text-[1.5rem] text-[#17302b] placeholder:text-[#8aa098] focus:border-[#1e4b43] focus:ring-2 focus:ring-[#1e4b43]/25 focus:outline-none"
                placeholder="email@example.com"
                aria-invalid={!!errors.email}
                {...register("email")}
              />
              {errors.email && (
                <p className="mt-[0.5rem] text-[1.2rem] text-[#b3261e]">
                  {errors.email.message}
                </p>
              )}
              <p className="mt-[0.6rem] text-[1.2rem] text-[#52695f]">
                Mã đặt vé luôn được gửi qua tin nhắn. Có email, bạn sẽ nhận thêm
                một bản qua thư.
              </p>
            </div>
          </div>
        </section>

        {/* 3. Hoá đơn */}
        <section
          className="rounded-[1.2rem] border border-[#d7e2de] bg-white p-[2rem]"
          id="sec-invoice"
        >
          <h2
            id="sec-invoice"
            className="mb-[1.6rem] text-[1.8rem] font-bold text-[#17302b]"
          >
            Hoá đơn VAT
          </h2>
          <div className="grid gap-[1rem] sm:grid-cols-2">
            {[
              { v: false, t: "Không xuất hoá đơn", d: "Xác nhận nhanh" },
              {
                v: true,
                t: "Xuất hoá đơn VAT",
                d: "Cần mã số thuế và email nhận hoá đơn",
              },
            ].map((o) => (
              <label
                key={o.t}
                className={`flex cursor-pointer gap-[1.2rem] rounded-[0.8rem] border p-[1.4rem] ${
                  needInvoice === o.v
                    ? "border-[#1e4b43] bg-[#eaf3f0]"
                    : "border-[#d7e2de] hover:bg-[#f6faf8]"
                }`}
              >
                <input
                  type="radio"
                  name="needInvoice"
                  className="mt-[0.4rem] accent-[#1e4b43]"
                  checked={needInvoice === o.v}
                  onChange={() =>
                    setValue("needInvoice", o.v, { shouldValidate: false })
                  }
                />
                <span>
                  <span className="block text-[1.5rem] font-bold">{o.t}</span>
                  <span className="block text-[1.3rem] text-[#52695f]">
                    {o.d}
                  </span>
                </span>
              </label>
            ))}
          </div>
          {needInvoice && (
            <div className="mt-[1.6rem] grid gap-[1.6rem] sm:grid-cols-2">
              <div>
                <label
                  htmlFor="taxCode"
                  className="mb-[0.6rem] block text-[1.3rem] font-semibold text-[#3b564f]"
                >
                  Mã số thuế *
                </label>
                <input
                  id="taxCode"
                  className="w-full rounded-[0.8rem] border border-[#c9d6d1] bg-white px-[1.4rem] py-[1.1rem] text-[1.5rem] text-[#17302b] placeholder:text-[#8aa098] focus:border-[#1e4b43] focus:ring-2 focus:ring-[#1e4b43]/25 focus:outline-none"
                  aria-invalid={!!errors.invoice?.taxCode}
                  {...register("invoice.taxCode")}
                />
                {errors.invoice?.taxCode && (
                  <p className="mt-[0.5rem] text-[1.2rem] text-[#b3261e]">
                    {errors.invoice.taxCode.message}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="invEmail"
                  className="mb-[0.6rem] block text-[1.3rem] font-semibold text-[#3b564f]"
                >
                  Email nhận hoá đơn *
                </label>
                <input
                  id="invEmail"
                  type="email"
                  className="w-full rounded-[0.8rem] border border-[#c9d6d1] bg-white px-[1.4rem] py-[1.1rem] text-[1.5rem] text-[#17302b] placeholder:text-[#8aa098] focus:border-[#1e4b43] focus:ring-2 focus:ring-[#1e4b43]/25 focus:outline-none"
                  aria-invalid={!!errors.invoice?.email}
                  {...register("invoice.email")}
                />
                {errors.invoice?.email && (
                  <p className="mt-[0.5rem] text-[1.2rem] text-[#b3261e]">
                    {errors.invoice.email.message}
                  </p>
                )}
              </div>
              <div className="sm:col-span-2">
                <label
                  htmlFor="company"
                  className="mb-[0.6rem] block text-[1.3rem] font-semibold text-[#3b564f]"
                >
                  Tên đơn vị *
                </label>
                <input
                  id="company"
                  className="w-full rounded-[0.8rem] border border-[#c9d6d1] bg-white px-[1.4rem] py-[1.1rem] text-[1.5rem] text-[#17302b] placeholder:text-[#8aa098] focus:border-[#1e4b43] focus:ring-2 focus:ring-[#1e4b43]/25 focus:outline-none"
                  aria-invalid={!!errors.invoice?.company}
                  {...register("invoice.company")}
                />
                {errors.invoice?.company && (
                  <p className="mt-[0.5rem] text-[1.2rem] text-[#b3261e]">
                    {errors.invoice.company.message}
                  </p>
                )}
              </div>
              <div className="sm:col-span-2">
                <label
                  htmlFor="address"
                  className="mb-[0.6rem] block text-[1.3rem] font-semibold text-[#3b564f]"
                >
                  Địa chỉ *
                </label>
                <input
                  id="address"
                  className="w-full rounded-[0.8rem] border border-[#c9d6d1] bg-white px-[1.4rem] py-[1.1rem] text-[1.5rem] text-[#17302b] placeholder:text-[#8aa098] focus:border-[#1e4b43] focus:ring-2 focus:ring-[#1e4b43]/25 focus:outline-none"
                  aria-invalid={!!errors.invoice?.address}
                  {...register("invoice.address")}
                />
                {errors.invoice?.address && (
                  <p className="mt-[0.5rem] text-[1.2rem] text-[#b3261e]">
                    {errors.invoice.address.message}
                  </p>
                )}
              </div>
            </div>
          )}
        </section>

        {/* 4. Thanh toán */}
        <section
          className="rounded-[1.2rem] border border-[#d7e2de] bg-white p-[2rem]"
          id="sec-pay"
        >
          <h2
            id="sec-pay"
            className="mb-[1.6rem] text-[1.8rem] font-bold text-[#17302b]"
          >
            Thanh toán
          </h2>
          <p className="mb-[1.6rem] text-[1.4rem] text-[#3b564f]">
            Toàn bộ vé trong đơn được thanh toán trong một giao dịch qua cổng
            thanh toán trực tuyến (thẻ ATM, Visa, Mastercard, QR).
          </p>

          <div className="rounded-[0.8rem] border border-dashed border-[#c2a24a] bg-[#fbf5e1] p-[1.4rem] text-[1.3rem] text-[#5c4a12]">
            <strong>Chính sách hoàn vé:</strong> chỉ hoàn tiền khi khu di tích
            dừng đón khách (thời tiết xấu hoặc lý do từ Ban Quản lý) hoặc hệ
            thống gặp sự cố. Khách không đi, đi sai ngày hoặc đến muộn{" "}
            <strong>không được hoàn tiền, không đổi ngày</strong>. Vé hết hiệu
            lực vào cuối ngày sử dụng.
          </div>

          <label className="mt-[1.6rem] flex cursor-pointer items-start gap-[1rem] text-[1.4rem]">
            <input
              type="checkbox"
              className="mt-[0.3rem] h-[1.8rem] w-[1.8rem] accent-[#1e4b43]"
              {...register("agree")}
            />
            <span>
              Tôi đã đọc và đồng ý với chính sách hoàn vé và điều khoản dịch vụ.
            </span>
          </label>
          {errors.agree && (
            <p className="mt-[0.5rem] text-[1.2rem] text-[#b3261e]">
              {errors.agree.message}
            </p>
          )}
        </section>
      </div>

      {/* Tóm tắt đơn hàng */}
      <aside className="lg:sticky lg:top-[2.4rem] lg:self-start">
        <div className="rounded-[1.2rem] border border-[#d7e2de] bg-white p-[2rem]">
          <h2 className="mb-[1.2rem] text-[1.8rem] font-bold">Đơn hàng</h2>
          <div className="text-[1.6rem] font-bold">Tuyến {route.name}</div>
          <div className="text-[1.3rem] text-[#52695f]">{route.path}</div>

          <dl className="mt-[1.6rem] space-y-[0.8rem] border-t border-[#e4ece9] pt-[1.4rem] text-[1.4rem]">
            <div className="flex justify-between">
              <dt className="text-[#52695f]">Ngày</dt>
              <dd className="font-semibold">{fmtDate(date)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[#52695f]">Hình thức</dt>
              <dd className="font-semibold">
                {mode === "shared" ? "Ghép đò" : "Bao thuyền"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-[#52695f]">Số khách</dt>
              <dd className="font-semibold">{qty} người</dd>
            </div>
          </dl>

          <dl className="mt-[1.4rem] space-y-[0.8rem] border-t border-[#e4ece9] pt-[1.4rem] text-[1.4rem]">
            <div className="flex justify-between">
              <dt>{adults} × Người lớn</dt>
              <dd className="font-semibold tabular-nums">
                {vnd(adults * price.adult)}
              </dd>
            </div>
            {kids > 0 && (
              <div className="flex justify-between">
                <dt>{kids} × Trẻ em</dt>
                <dd className="font-semibold tabular-nums">
                  {vnd(kids * price.child)}
                </dd>
              </div>
            )}
            {mode === "charter" && (
              <div className="flex justify-between">
                <dt>Phụ phí bao thuyền</dt>
                <dd className="font-semibold tabular-nums">
                  {vnd(charterFee)}
                </dd>
              </div>
            )}
          </dl>

          <div className="mt-[1.4rem] flex items-baseline justify-between border-t border-[#e4ece9] pt-[1.4rem]">
            <span className="text-[1.5rem] font-bold">Tổng cộng</span>
            <span className="text-[2.6rem] font-extrabold text-[#a6324f] tabular-nums">
              {vnd(total)}
            </span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-[1.6rem] w-full rounded-[1rem] bg-[#a6324f] px-[1.6rem] py-[1.4rem] text-[1.6rem] font-bold text-white transition-colors hover:bg-[#8d2842] focus-visible:outline focus-visible:outline-[0.3rem] focus-visible:outline-offset-2 focus-visible:outline-[#1e4b43] disabled:cursor-wait disabled:opacity-60"
          >
            {isSubmitting ? "Đang tạo đơn..." : `Thanh toán ${vnd(total)}`}
          </button>
          {submitError && (
            <p
              role="alert"
              className="mt-[0.5rem] text-[1.2rem] text-[#b3261e]"
            >
              {submitError}
            </p>
          )}
          {Object.keys(errors).length > 0 && !submitError && (
            <p
              role="alert"
              className="mt-[0.5rem] text-[1.2rem] text-[#b3261e]"
            >
              Còn thông tin cần kiểm tra ở các mục phía trên.
            </p>
          )}

          <ul className="mt-[1.4rem] space-y-[0.4rem] text-[1.2rem] text-[#52695f]">
            <li>Mã đặt vé gửi qua tin nhắn ngay sau khi thanh toán.</li>
            <li>Đến khu vực bán vé tại bến để check-in và nhận số hiệu đò.</li>
            <li>Vé chỉ dùng trong ngày đã chọn.</li>
          </ul>
        </div>
      </aside>
    </form>
  )
}
