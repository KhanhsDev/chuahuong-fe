"use client"

import { useEffect, useState } from "react"
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form"
import Link from "next/link"

import { zodResolver } from "@hookform/resolvers/zod"
import dayjs from "dayjs"
import { z } from "zod"

import Container from "@/components/Container"
import StarRating from "@/components/Review/StarRating"
import { routes } from "@/data/content"
import type { ReviewBoat, ReviewPayload } from "@/interface/common"
import {
  type ReviewInfo,
  ReviewServiceError,
  useReviewService,
} from "@/services/reviewService"

const quickTags = ["Thân thiện", "Đúng giờ", "An toàn", "Sạch sẽ"] as const

const reviewSchema = z.object({
  reviews: z
    .array(
      z.object({
        assignmentId: z.string().min(1),
        rating: z.number().int().min(1, "Vui lòng chọn số sao").max(5),
        comment: z.string().max(500, "Nhận xét tối đa 500 ký tự"),
        tags: z.array(z.string()),
      })
    )
    .min(1),
})

type ReviewData = ReviewInfo

const fieldClass =
  "mt-2 min-h-32 w-full rounded-xl border-2 border-black/20 bg-white p-4 text-lg text-ink outline-none focus:border-jade-700 focus:ring-4 focus:ring-jade-100"

export default function ReviewExperience({ token }: { token: string }) {
  const [record, setRecord] = useState<ReviewData | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(true)
  const { getReviewByToken, submitReview } = useReviewService()
  const {
    control,
    register,
    handleSubmit,
    reset,
    getValues,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ReviewPayload>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { reviews: [] },
  })
  const { fields } = useFieldArray({ control, name: "reviews" })
  const watchedReviews = useWatch({ control, name: "reviews" })

  useEffect(() => {
    let active = true
    async function loadReview() {
      try {
        const result = await getReviewByToken(token)
        if (!active) return
        setRecord(result)
        setSubmitted(result.submitted)
        reset({
          reviews: result.boats.map((boat) => ({
            assignmentId: boat.assignmentId,
            rating: 0,
            comment: "",
            tags: [],
          })),
        })
      } catch (error) {
        if (!active) return
        setLoadError(
          error instanceof ReviewServiceError && error.code === "NOT_FOUND"
            ? "Đường dẫn đánh giá không hợp lệ hoặc đã hết hạn. Nếu cần hỗ trợ, vui lòng liên hệ quầy dịch vụ."
            : error instanceof Error
              ? error.message
              : "Không thể tải thông tin chuyến đi. Vui lòng thử lại."
        )
      } finally {
        if (active) setLoading(false)
      }
    }
    void loadReview()
    return () => {
      active = false
    }
  }, [getReviewByToken, reset, token])

  async function onSubmit(payload: ReviewPayload) {
    setSubmitError(null)
    try {
      await submitReview(token, payload)
      setSubmitted(true)
    } catch (error) {
      if (error instanceof ReviewServiceError && error.code === "NOT_FOUND") {
        setLoadError(error.message)
      } else if (
        error instanceof ReviewServiceError &&
        error.code === "ALREADY_SUBMITTED"
      ) {
        setSubmitted(true)
      } else {
        setSubmitError(
          error instanceof Error
            ? error.message
            : "Chưa gửi được đánh giá. Vui lòng thử lại."
        )
      }
    }
  }

  function toggleTag(index: number, tag: string) {
    const name = `reviews.${index}.tags` as const
    const selected = getValues(name)
    setValue(
      name,
      selected.includes(tag)
        ? selected.filter((item) => item !== tag)
        : [...selected, tag],
      { shouldDirty: true, shouldValidate: true }
    )
  }

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
            Đánh giá chuyến đi
          </h1>
          <p className="mt-3 text-lg text-ink/80">
            Chia sẻ cảm nhận để chúng tôi phục vụ du khách tốt hơn.
          </p>
        </header>

        {loading && (
          <div
            aria-label="Đang tải thông tin chuyến đi"
            className="animate-pulse space-y-4 rounded-3xl bg-white p-6"
          >
            <div className="h-7 w-1/2 rounded bg-black/10" />
            <div className="h-20 rounded bg-black/10" />
          </div>
        )}

        {loadError && !loading && (
          <section
            role="alert"
            className="rounded-3xl border-2 border-amber-600 bg-amber-50 p-6"
          >
            <h2 className="text-2xl font-extrabold">Không mở được đánh giá</h2>
            <p className="mt-2 text-lg">{loadError}</p>
          </section>
        )}

        {(record?.submitted || submitted) && !loading && (
          <section
            role="status"
            className="rounded-3xl border-2 border-jade-700 bg-jade-50 p-6"
          >
            <h2 className="text-3xl font-extrabold text-jade-900">
              Cảm ơn bạn đã đánh giá!
            </h2>
            <p className="mt-2 text-lg">
              Đánh giá cho chuyến đi này đã được ghi nhận. Mỗi liên kết chỉ gửi
              đánh giá một lần.
            </p>
          </section>
        )}

        {record && !submitted && !loading && !loadError && (
          <form
            noValidate
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5"
          >
            {fields.map((field, index) => {
              const boat = record.boats[index]
              return (
                <ReviewBoatCard
                  key={field.id}
                  boat={boat}
                  index={index}
                  control={control}
                  register={register}
                  errors={errors}
                  onToggleTag={toggleTag}
                  tags={watchedReviews[index]?.tags ?? []}
                />
              )
            })}

            {submitError && (
              <p
                role="alert"
                className="rounded-2xl border-2 border-red-700 bg-red-50 p-4 text-lg font-bold text-red-950"
              >
                {submitError}
              </p>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="min-h-[4.8rem] w-full rounded-full bg-jade-700 px-6 py-3 text-lg font-extrabold text-white hover:bg-jade-900 focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-jade-700 disabled:cursor-wait disabled:opacity-60"
            >
              {isSubmitting ? "Đang gửi đánh giá…" : "Gửi đánh giá"}
            </button>
          </form>
        )}
      </Container>
    </main>
  )
}

function ReviewBoatCard({
  boat,
  index,
  control,
  register,
  errors,
  onToggleTag,
  tags,
}: {
  boat: ReviewBoat
  index: number
  control: ReturnType<typeof useForm<ReviewPayload>>["control"]
  register: ReturnType<typeof useForm<ReviewPayload>>["register"]
  errors: ReturnType<typeof useForm<ReviewPayload>>["formState"]["errors"]
  onToggleTag: (index: number, tag: string) => void
  tags: string[]
}) {
  const route = routes.find((candidate) => candidate.id === boat.routeId)
  const ratingErrorId = `review-rating-error-${index}`
  const ratingError = errors.reviews?.[index]?.rating?.message

  return (
    <section className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm sm:p-8">
      <input type="hidden" {...register(`reviews.${index}.assignmentId`)} />
      <p className="text-sm font-bold tracking-widest text-jade-700 uppercase">
        Đò {index + 1}
      </p>
      <h2 className="mt-1 text-2xl font-extrabold">
        Số hiệu đò {boat.boat.id}
      </h2>
      <p className="mt-2 text-base">
        {route?.name ?? "Tuyến tham quan"} ·{" "}
        {dayjs(boat.date).format("DD/MM/YYYY")}
      </p>

      <fieldset className="mt-6">
        <legend className="mb-3 text-lg font-bold">
          Bạn đánh giá chuyến đi thế nào? <span aria-hidden="true">*</span>
        </legend>
        <Controller
          control={control}
          name={`reviews.${index}.rating`}
          render={({ field }) => (
            <StarRating
              value={field.value}
              onChange={field.onChange}
              errorId={ratingError ? ratingErrorId : undefined}
            />
          )}
        />
        {ratingError && (
          <p
            id={ratingErrorId}
            role="alert"
            className="mt-2 text-base font-bold text-red-800"
          >
            {ratingError}
          </p>
        )}
      </fieldset>

      <fieldset className="mt-6">
        <legend className="mb-3 text-lg font-bold">
          Điểm bạn muốn ghi nhận
        </legend>
        <div className="flex flex-wrap gap-2">
          {quickTags.map((tag) => {
            const selected = tags.includes(tag)
            return (
              <button
                key={tag}
                type="button"
                aria-pressed={selected}
                onClick={() => onToggleTag(index, tag)}
                className={`min-h-[4.8rem] rounded-full border-2 px-5 py-2 text-base font-bold focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-jade-700 ${
                  selected
                    ? "border-jade-700 bg-jade-700 text-white"
                    : "border-jade-700 bg-white text-jade-900"
                }`}
              >
                {tag}
              </button>
            )
          })}
        </div>
      </fieldset>

      <label className="mt-6 block text-lg font-bold">
        Nhận xét (không bắt buộc)
        <textarea
          maxLength={500}
          aria-invalid={Boolean(errors.reviews?.[index]?.comment)}
          className={fieldClass}
          placeholder="Chia sẻ thêm trải nghiệm của bạn…"
          {...register(`reviews.${index}.comment`)}
        />
        <span className="mt-1 block text-sm font-normal text-ink/70">
          Tối đa 500 ký tự
        </span>
        {errors.reviews?.[index]?.comment?.message && (
          <span
            role="alert"
            className="mt-1 block text-base font-bold text-red-800"
          >
            {errors.reviews[index]?.comment?.message}
          </span>
        )}
      </label>
    </section>
  )
}
