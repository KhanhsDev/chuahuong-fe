"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import Link from "next/link"

import { zodResolver } from "@hookform/resolvers/zod"
import dayjs from "dayjs"
import { z } from "zod"

import OrderSummary from "@/components/Checkin/OrderSummary"
import TicketCard from "@/components/Checkin/TicketCard"
import WaitingScreen from "@/components/Checkin/WaitingScreen"
import Container from "@/components/Container"
import type { BoatAssignment, CheckinOrder } from "@/interface/common"
import {
  type AssignmentStatus,
  type CheckinErrorCode,
  CheckinServiceError,
  useCheckinService,
} from "@/services/checkinService"

import printStyles from "./TicketCard.module.css"

const lookupSchema = z.object({
  code: z.string().trim().toUpperCase().min(1, "Vui lòng nhập mã đặt vé"),
  phone: z
    .string()
    .trim()
    .regex(/^0\d{9}$/, "Số điện thoại phải có 10 số và bắt đầu bằng 0"),
})

type LookupValues = z.infer<typeof lookupSchema>
type RetryMode = "lookup" | "confirm"

const fieldClass =
  "mt-1 min-h-[4.8rem] w-full rounded-xl border-2 border-black/20 bg-white px-4 py-3 text-lg text-ink outline-none focus:border-jade-700 focus:ring-4 focus:ring-jade-100"

const toCheckinError = (error: unknown) => {
  if (error instanceof CheckinServiceError) return error
  if (error instanceof TypeError) {
    return new CheckinServiceError(
      "NETWORK",
      "Mất kết nối, vui lòng ra quầy hỗ trợ để được xử lý thủ công."
    )
  }
  return new CheckinServiceError(
    "UNKNOWN",
    "Đã có lỗi xảy ra. Vui lòng thử lại."
  )
}

const CheckinExperience = ({
  initialCode,
  initialPhone,
}: {
  initialCode: string
  initialPhone: string
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LookupValues>({
    resolver: zodResolver(lookupSchema),
    defaultValues: { code: initialCode, phone: initialPhone },
  })
  const [order, setOrder] = useState<CheckinOrder | null>(null)
  const [assignments, setAssignments] = useState<BoatAssignment[] | null>(null)
  const [waiting, setWaiting] = useState(false)
  const [estimatedWaitSeconds, setEstimatedWaitSeconds] = useState(12)
  const [failure, setFailure] = useState<{
    code: CheckinErrorCode
    message: string
    order?: CheckinOrder
  } | null>(null)
  const [retryMode, setRetryMode] = useState<RetryMode>("lookup")
  const [lastLookup, setLastLookup] = useState<LookupValues | null>(null)
  const [loading, setLoading] = useState(false)
  const { lookupOrder, confirmCheckin, getAssignmentStatus } =
    useCheckinService()

  const applyAssignmentStatus = async (result: AssignmentStatus) => {
    if (result.status === "waiting") {
      setWaiting(true)
      setEstimatedWaitSeconds(result.estimatedWaitSeconds)
      return
    }
    setWaiting(false)
    setAssignments(result.assignments)
  }

  const lookup = async (values: LookupValues) => {
    setLoading(true)
    setFailure(null)
    setOrder(null)
    setAssignments(null)
    setWaiting(false)
    setLastLookup(values)
    setRetryMode("lookup")
    try {
      const foundOrder = await lookupOrder(values.code, values.phone)
      setOrder(foundOrder)
      if (foundOrder.alreadyCheckedIn) {
        await applyAssignmentStatus(await getAssignmentStatus(foundOrder.id))
      }
    } catch (error) {
      const serviceError = toCheckinError(error)
      setFailure({
        code: serviceError.code,
        message: serviceError.message,
        order: serviceError.order,
      })
    } finally {
      setLoading(false)
    }
  }

  const submitCheckin = async () => {
    if (!order) return
    setLoading(true)
    setFailure(null)
    setRetryMode("confirm")
    try {
      await applyAssignmentStatus(await confirmCheckin(order.id))
    } catch (error) {
      setFailureFromError(error)
    } finally {
      setLoading(false)
    }
  }

  const setFailureFromError = (error: unknown) => {
    const serviceError = toCheckinError(error)
    setFailure({
      code: serviceError.code,
      message: serviceError.message,
      order: serviceError.order,
    })
  }

  const retry = async () => {
    setFailure(null)
    if (retryMode === "confirm") {
      await submitCheckin()
      return
    }
    if (lastLookup) await lookup(lastLookup)
  }

  useEffect(() => {
    if (!waiting || !order) return
    const timer = window.setInterval(async () => {
      try {
        await applyAssignmentStatus(await getAssignmentStatus(order.id))
      } catch (error) {
        setWaiting(false)
        setFailureFromError(error)
      }
    }, 5_000)
    return () => window.clearInterval(timer)
  }, [waiting, order, getAssignmentStatus])

  const showNetworkError = failure?.code === "NETWORK"

  return (
    <main className="min-h-screen bg-sand py-8 text-ink sm:py-12">
      <Container className="max-w-[76rem]">
        <Link
          href="/"
          className="inline-flex min-h-[4.8rem] items-center font-bold text-jade-700 underline underline-offset-4 focus-visible:outline-4 focus-visible:outline-jade-700"
        >
          ← Về trang chủ
        </Link>
        <header className="my-7">
          <p className="text-sm font-extrabold tracking-[0.2em] text-brand-700 uppercase">
            Hệ sinh thái số Chùa Hương
          </p>
          <h1 className="mt-2 text-4xl font-black text-jade-900 sm:text-5xl">
            Check-in vé và nhận đò
          </h1>
          <p className="mt-3 text-lg text-ink/80">
            Nhập mã đặt vé và số điện thoại người mua để nhận vé đò.
          </p>
        </header>

        {showNetworkError && (
          <div
            role="alert"
            className="mb-5 rounded-2xl border-2 border-red-800 bg-red-50 p-5 text-lg font-bold text-red-950"
          >
            Mất kết nối, vui lòng ra quầy hỗ trợ để được xử lý thủ công.
            <button
              type="button"
              onClick={retry}
              disabled={loading}
              className="mt-4 min-h-[4.8rem] w-full rounded-full bg-red-900 px-5 py-3 text-white focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-red-900 disabled:opacity-60"
            >
              Thử kết nối lại
            </button>
          </div>
        )}

        <section className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-sm font-bold tracking-widest text-jade-700 uppercase">
            Bước 1 · Tra cứu
          </p>
          <form
            noValidate
            onSubmit={handleSubmit(lookup)}
            className="mt-4 grid gap-4 sm:grid-cols-2"
          >
            <label className="block text-base font-bold">
              Mã đặt vé
              <input
                autoComplete="off"
                aria-invalid={Boolean(errors.code)}
                aria-describedby={
                  errors.code ? "checkin-code-error" : undefined
                }
                className={fieldClass}
                placeholder="Ví dụ: CH2610001"
                {...register("code")}
              />
              {errors.code?.message && (
                <span
                  id="checkin-code-error"
                  role="alert"
                  className="mt-1 block text-base font-bold text-red-800"
                >
                  {errors.code.message}
                </span>
              )}
            </label>
            <label className="block text-base font-bold">
              Số điện thoại người mua
              <input
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                aria-invalid={Boolean(errors.phone)}
                aria-describedby={
                  errors.phone ? "checkin-phone-error" : undefined
                }
                className={fieldClass}
                placeholder="10 số, bắt đầu bằng 0"
                {...register("phone")}
              />
              {errors.phone?.message && (
                <span
                  id="checkin-phone-error"
                  role="alert"
                  className="mt-1 block text-base font-bold text-red-800"
                >
                  {errors.phone.message}
                </span>
              )}
            </label>
            <button
              type="submit"
              disabled={isSubmitting || loading}
              className="min-h-[4.8rem] rounded-full bg-brand-600 px-6 py-3 text-lg font-extrabold text-white hover:bg-brand-700 focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-brand-700 disabled:cursor-wait disabled:opacity-60 sm:col-span-2"
            >
              {loading ? "Đang tra cứu…" : "Tra cứu vé"}
            </button>
          </form>
        </section>

        {loading && (
          <div
            aria-label="Đang tải thông tin vé"
            className="mt-5 animate-pulse space-y-3 rounded-3xl bg-white p-6"
          >
            <div className="h-6 w-1/3 rounded bg-black/10" />
            <div className="h-16 rounded bg-black/10" />
            <div className="h-16 rounded bg-black/10" />
          </div>
        )}

        {failure && !showNetworkError && (
          <section
            role="alert"
            className={`mt-5 rounded-3xl border-2 p-6 ${
              failure.code === "NOT_FOUND"
                ? "border-amber-500 bg-amber-50"
                : "border-red-700 bg-red-50"
            }`}
          >
            <h2 className="text-2xl font-extrabold">
              {failure.code === "NOT_FOUND"
                ? "Chưa tìm thấy đơn vé"
                : failure.code === "WRONG_DATE"
                  ? "Vé không đúng ngày"
                  : failure.code === "EXPIRED"
                    ? "Vé đã hết hạn"
                    : failure.code === "REFUNDED"
                      ? "Vé đã được hoàn"
                      : failure.code === "PAYMENT_PENDING"
                        ? "Đơn đang chờ thanh toán"
                        : "Chưa thể xử lý yêu cầu"}
            </h2>
            <p className="mt-2 text-lg">{failure.message}</p>
            {failure.code === "NOT_FOUND" && (
              <p className="mt-2 text-base">
                Hãy kiểm tra lại mã/SĐT hoặc ra quầy để được hỗ trợ.
              </p>
            )}
            {failure.code === "WRONG_DATE" && failure.order && (
              <p className="mt-2 text-lg font-bold">
                Ngày ghi trên đơn:{" "}
                {dayjs(failure.order.date).format("DD/MM/YYYY")}. Vé không dùng
                được ngày khác; vui lòng ra quầy mua vé mới. Vé cũ không được
                hoàn.
              </p>
            )}
            {failure.code === "QUEUE_EMPTY" && (
              <p className="mt-2 text-base">
                Vui lòng chờ thêm hoặc ra quầy để nhân viên hỗ trợ xếp đò.
              </p>
            )}
          </section>
        )}

        {failure?.code === "QUEUE_EMPTY" && order && !waiting && (
          <div className="mt-5">
            <WaitingScreen
              estimatedWaitSeconds={12}
              onStop={() => setFailure(null)}
            />
          </div>
        )}

        {order && !assignments && !waiting && !loading && !failure && (
          <div className="mt-5">
            <OrderSummary
              order={order}
              onConfirm={submitCheckin}
              isLoading={loading}
            />
          </div>
        )}

        {waiting && (
          <div className="mt-5">
            <WaitingScreen
              estimatedWaitSeconds={estimatedWaitSeconds}
              onStop={() => setWaiting(false)}
            />
          </div>
        )}

        {assignments && order && (
          <section className="mt-6">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-sm font-bold tracking-widest text-jade-700 uppercase">
                  Bước 3 · Kết quả phân đò
                </p>
                <h2 className="mt-1 text-3xl font-extrabold">
                  Vé đò của đoàn bạn
                </h2>
              </div>
              <button
                type="button"
                onClick={() => window.print()}
                className="min-h-[4.8rem] rounded-full bg-jade-900 px-7 py-3 text-lg font-bold text-white focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-jade-900"
              >
                In vé
              </button>
            </div>
            <div className={`${printStyles.printContainer} space-y-4`}>
              {assignments.map((assignment, index) => (
                <TicketCard
                  key={assignment.id}
                  assignment={assignment}
                  order={order}
                  index={index}
                  total={assignments.length}
                />
              ))}
            </div>
          </section>
        )}
      </Container>
    </main>
  )
}

export default CheckinExperience
