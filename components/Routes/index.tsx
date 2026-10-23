"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Container from "@/components/Container"
import SectionHeading from "@/components/SectionHeading"
import {
  MAX_TICKETS_PER_ORDER,
  prices,
  routes,
  vnd,
  type Route,
} from "@/data/content"
import { useRouter } from "next/navigation"
const DAYS_SHOWN = 6

type Day = { iso: string; day: number; month: number }

const pad = (n: number) => String(n).padStart(2, "0")
const toISO = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const short = (n: number) => `${Math.round(n / 1000)}k`

/** TODO: thay bằng giá theo ngày lấy từ API (Ban Quản lý cấu hình từng ngày). */
const priceFor = (_iso: string, kind: "adult" | "child") => prices[kind].weekday

export default function Routes() {
  const [selected, setSelected] = useState<string>(routes[0].id)
  const [days, setDays] = useState<Day[]>([])
  const [date, setDate] = useState("")
  const [adult, setAdult] = useState(2)
  const [child, setChild] = useState(0)
  const dateInput = useRef<HTMLInputElement>(null)
  const router = useRouter()
  useEffect(() => {
    const list: Day[] = Array.from({ length: DAYS_SHOWN }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() + i)
      return { iso: toISO(d), day: d.getDate(), month: d.getMonth() + 1 }
    })
    setDays(list)
    setDate(list[0].iso)
  }, [])

  const total = adult + child
  const overLimit = total > MAX_TICKETS_PER_ORDER
  const adultPrice = date ? priceFor(date, "adult") : prices.adult.weekday
  const childPrice = date ? priceFor(date, "child") : prices.child.weekday
  const estimate = useMemo(
    () => adult * adultPrice + child * childPrice,
    [adult, child, adultPrice, childPrice]
  )
  const canBook = !!date && total >= 1 && !overLimit

  const onBook = (route: Route) => {
    if (!canBook) return
    // TODO: chuyển sang bước nhập thông tin người mua và thanh toán
    console.log({ route: route.id, date, adult, child })
    router.push(
      `/booking?route=${route.id}&date=${date}&adult=${adult}&child=${child}`
    )
  }

  return (
    <section id="tuyen" className="py-16 sm:py-24">
      <Container className="max-w-[88rem]">
        <SectionHeading
          eyebrow="Tuyến tham quan"
          title="Ba tuyến, chọn hành trình của bạn"
        />

        <div
          role="radiogroup"
          aria-label="Chọn tuyến tham quan"
          className="mt-10 space-y-4 rounded-3xl border border-brand-100 bg-brand-50/50 p-4 sm:p-6"
        >
          {routes.map((r) => {
            const active = r.id === selected
            return (
              <article
                key={r.id}
                className={`rounded-2xl border bg-white ${
                  active ? "border-jade-600 bg-jade-50" : "border-black/10"
                }`}
              >
                <div className="flex flex-wrap items-center gap-x-4 gap-y-3 p-4 sm:px-5">
                  <label className="flex min-w-0 flex-1 cursor-pointer items-start gap-3">
                    <input
                      type="radio"
                      name="route"
                      checked={active}
                      onChange={() => setSelected(r.id)}
                      className="mt-2 size-4 accent-jade-600"
                    />
                    <span className="min-w-0">
                      <span className="block text-lg font-bold">{r.name}</span>
                      <span className="block text-sm text-ink/70">
                        {r.path}
                      </span>
                      <span className="mt-1 block text-xs text-ink/50">
                        Đò nhỏ {r.small} phút · Đò to {r.large} phút
                      </span>
                    </span>
                  </label>

                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-ink/60">Từ</span>
                    <strong className="text-lg text-brand-600">
                      {vnd(prices.child.weekday)}
                    </strong>
                    <span className="text-ink/60">/khách</span>
                    <button
                      type="button"
                      onClick={() => setSelected(r.id)}
                      className={`rounded-lg px-4 py-2 font-bold ${
                        active
                          ? "border border-jade-600 text-jade-700"
                          : "bg-brand-600 text-white hover:bg-brand-700"
                      }`}
                    >
                      {active ? "✓ Đã chọn" : "Chọn"}
                    </button>
                  </div>
                </div>

                {active && (
                  <div className="space-y-5 border-t border-dashed border-black/10 px-4 pt-5 pb-6 sm:px-5">
                    {/* Ngày sử dụng */}
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start">
                      <p className="pt-3 text-sm font-bold tracking-wide uppercase lg:w-[14rem]">
                        📅 Ngày sử dụng
                      </p>
                      <div className="flex flex-wrap gap-3">
                        {days.map((d) => {
                          const on = d.iso === date
                          return (
                            <button
                              type="button"
                              key={d.iso}
                              onClick={() => setDate(d.iso)}
                              className={`w-[7.8rem] rounded-xl border px-2 py-2 text-center ${
                                on
                                  ? "border-jade-600 bg-jade-50 text-jade-700"
                                  : "border-brand-100 bg-white hover:bg-black/5"
                              }`}
                            >
                              <span className="block text-xs font-semibold">
                                Th{d.month}
                              </span>
                              <span className="block text-2xl font-bold">
                                {d.day}
                              </span>
                              <span className="block text-xs font-bold text-brand-600">
                                {short(priceFor(d.iso, "adult"))}
                              </span>
                            </button>
                          )
                        })}
                        <button
                          type="button"
                          onClick={() => dateInput.current?.showPicker?.()}
                          className="w-[7.8rem] rounded-xl border border-brand-100 bg-white px-2 py-2 text-center text-xs font-semibold hover:bg-black/5"
                        >
                          Tất cả
                          <span className="mt-1 block text-lg" aria-hidden>
                            🗓️
                          </span>
                        </button>
                      </div>
                    </div>

                    <input
                      ref={dateInput}
                      type="date"
                      min={days[0]?.iso}
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      aria-label="Chọn ngày đi"
                      className="w-full rounded-xl border border-brand-100 bg-white px-4 py-3 text-base outline-none focus:border-jade-600 focus:ring-2 focus:ring-jade-100"
                    />

                    {/* Số khách */}
                    <div className="border-t border-dashed border-black/10 pt-5">
                      <p className="mb-3 text-sm font-bold tracking-wide text-ink/70 uppercase">
                        Số khách
                      </p>
                      <div className="space-y-4">
                        <GuestRow
                          label="Người lớn"
                          price={adultPrice}
                          value={adult}
                          onChange={setAdult}
                        />
                        <GuestRow
                          label="Trẻ em"
                          price={childPrice}
                          value={child}
                          onChange={setChild}
                        />
                      </div>
                      {overLimit && (
                        <p
                          role="alert"
                          className="mt-3 rounded-lg bg-brand-50 p-3 text-sm text-brand-700"
                        >
                          Mỗi lượt mua tối đa {MAX_TICKETS_PER_ORDER} vé. Đoàn
                          đông hơn vui lòng tách thành nhiều đơn hàng.
                        </p>
                      )}
                    </div>

                    <div className="flex items-end justify-between border-t border-dashed border-black/10 pt-5">
                      <span className="text-ink/60">Tạm tính</span>
                      <strong className="text-3xl text-brand-600">
                        {vnd(estimate)}
                      </strong>
                    </div>

                    <div className="text-center">
                      <button
                        type="button"
                        disabled={!canBook}
                        onClick={() => onBook(r)}
                        className="rounded-xl bg-brand-600 px-10 py-3.5 text-base font-bold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Đặt vé ngay
                      </button>
                    </div>
                  </div>
                )}
              </article>
            )
          })}
        </div>
      </Container>
    </section>
  )
}

function GuestRow({
  label,
  price,
  value,
  onChange,
}: {
  label: string
  price: number
  value: number
  onChange: (n: number) => void
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-base font-bold">{label}</p>
        <p className="text-sm font-bold text-brand-600">{vnd(price)}</p>
      </div>
      <div className="flex items-center gap-4">
        <StepButton
          label={`Giảm ${label}`}
          onClick={() => onChange(Math.max(0, value - 1))}
        >
          −
        </StepButton>
        <span className="w-6 text-center text-lg font-bold">{value}</span>
        <StepButton label={`Tăng ${label}`} onClick={() => onChange(value + 1)}>
          +
        </StepButton>
      </div>
    </div>
  )
}

function StepButton({
  label,
  onClick,
  children,
}: {
  label: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="size-10 rounded-lg border border-brand-100 bg-white text-xl hover:bg-black/5"
    >
      {children}
    </button>
  )
}
