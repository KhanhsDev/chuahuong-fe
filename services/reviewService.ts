import { useCallback, useRef } from "react"

import { z } from "zod"

import { type ApiResponse, METHOD } from "@/hooks/global"
import { useMutation } from "@/hooks/swr"
import type {
  ReviewBoat,
  ReviewErrorCode,
  ReviewPayload,
  RouteId,
} from "@/interface/common"

export type { ReviewErrorCode } from "@/interface/common"

export class ReviewServiceError extends Error {
  constructor(
    public readonly code: ReviewErrorCode,
    message: string
  ) {
    super(message)
    this.name = "ReviewServiceError"
  }
}

const reviewDataSchema = z.object({
  token: z.string(),
  orderId: z.string(),
  boats: z.array(
    z.object({
      assignmentId: z.string(),
      boat: z.object({
        id: z.string(),
        size: z.enum(["small", "large"]),
        capacity: z.number().int(),
        gate: z.number().int(),
        driverPhone: z.string(),
        queueOrder: z.number().int(),
      }),
      routeId: z.string(),
      date: z.string(),
    })
  ),
  submitted: z.boolean(),
})

const submitResultSchema = z.object({ submitted: z.boolean() })
const reviewPayloadSchema = z.object({
  reviews: z
    .array(
      z.object({
        assignmentId: z.string().min(1),
        rating: z.number().int().min(1).max(5),
        comment: z.string().max(500),
        tags: z.array(z.string()),
      })
    )
    .min(1),
})
const routeIds: RouteId[] = ["huong-tich", "long-van", "tuyet-son"]

const mapRouteId = (routeId: string): RouteId => {
  const normalized = routeId.replaceAll("_", "-")
  if (!routeIds.includes(normalized as RouteId)) {
    throw new ReviewServiceError(
      "UNKNOWN",
      "Hệ thống trả về tuyến không hợp lệ. Vui lòng thử lại."
    )
  }
  return normalized as RouteId
}

const mapReviewData = (
  data: z.infer<typeof reviewDataSchema>
): {
  token: string
  orderId: string
  boats: ReviewBoat[]
  submitted: boolean
} => ({
  ...data,
  boats: data.boats.map((boat) => ({
    ...boat,
    routeId: mapRouteId(boat.routeId),
  })),
})

export type ReviewInfo = ReturnType<typeof mapReviewData>

const parseApiError = (error: unknown): ReviewServiceError => {
  const response = (
    error as {
      response?: {
        status?: number
        data?: {
          data?: {
            error?: {
              code?: string
              message?: string
              details?: Record<string, unknown>
            }
          }
        }
      }
    }
  ).response
  const apiError = response?.data?.data?.error
  const code = apiError?.code as ReviewErrorCode
  const supported: ReviewErrorCode[] = [
    "NOT_FOUND",
    "WRONG_DATE",
    "EXPIRED",
    "REFUNDED",
    "PAYMENT_PENDING",
    "ALREADY_SUBMITTED",
    "INVALID_REVIEW",
    "RATE_LIMITED",
    "NETWORK",
    "UNKNOWN",
  ]
  const safeCode = supported.includes(code)
    ? code
    : response?.status === 429
      ? "RATE_LIMITED"
      : "UNKNOWN"
  return new ReviewServiceError(
    safeCode,
    apiError?.message ?? "Đã có lỗi xảy ra. Vui lòng thử lại."
  )
}

export const useReviewService = () => {
  const currentToken = useRef("")
  const { trigger: infoTrigger } = useMutation<
    z.infer<typeof reviewDataSchema>
  >("/api/v1/user/reviews/info", {
    url: () =>
      `/api/v1/user/reviews/${encodeURIComponent(currentToken.current)}`,
    method: METHOD.GET,
    noAuth: true,
  })
  const { trigger: submitTrigger } = useMutation<
    z.infer<typeof submitResultSchema>
  >("/api/v1/user/reviews/submit", {
    url: () =>
      `/api/v1/user/reviews/${encodeURIComponent(currentToken.current)}`,
    method: METHOD.POST,
    noAuth: true,
  })
  const getReviewByToken = useCallback(
    async (token: string) => {
      currentToken.current = token
      try {
        const response = await infoTrigger()
        const result = reviewDataSchema.safeParse(
          (response as ApiResponse<unknown>).data
        )
        if (!result.success)
          throw new ReviewServiceError(
            "UNKNOWN",
            "Dữ liệu đánh giá không hợp lệ."
          )
        return mapReviewData(result.data)
      } catch (error) {
        if (error instanceof ReviewServiceError) throw error
        throw parseApiError(error)
      }
    },
    [infoTrigger]
  )
  const submitReview = useCallback(
    async (token: string, payload: ReviewPayload) => {
      const parsed = reviewPayloadSchema.safeParse(payload)
      if (!parsed.success) {
        throw new ReviewServiceError(
          "INVALID_REVIEW",
          "Dữ liệu đánh giá không hợp lệ."
        )
      }
      currentToken.current = token
      try {
        const response = await submitTrigger(parsed.data)
        const result = submitResultSchema.safeParse(
          (response as ApiResponse<unknown>).data
        )
        if (!result.success)
          throw new ReviewServiceError(
            "UNKNOWN",
            "Dữ liệu đánh giá không hợp lệ."
          )
        return result.data
      } catch (error) {
        if (error instanceof ReviewServiceError) throw error
        throw parseApiError(error)
      }
    },
    [submitTrigger]
  )
  return { getReviewByToken, submitReview }
}
