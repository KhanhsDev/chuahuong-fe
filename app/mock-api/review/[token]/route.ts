import { z } from "zod"

import {
  getReviewByToken,
  ReviewServiceError,
  submitReview,
} from "@/services/mockReviewService"

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

type RouteContext = { params: Promise<{ token: string }> }

export async function GET(_request: Request, { params }: RouteContext) {
  const { token } = await params
  try {
    return Response.json(await getReviewByToken(token))
  } catch (error) {
    if (!(error instanceof ReviewServiceError)) throw error
    return Response.json(
      { code: error.code, message: error.message },
      { status: error.code === "NOT_FOUND" ? 404 : 409 }
    )
  }
}

export async function POST(request: Request, { params }: RouteContext) {
  const { token } = await params
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json(
      { code: "UNKNOWN", message: "Thông tin đánh giá không hợp lệ." },
      { status: 400 }
    )
  }

  const parsed = reviewPayloadSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json(
      { code: "UNKNOWN", message: "Thông tin đánh giá không hợp lệ." },
      { status: 400 }
    )
  }

  try {
    await submitReview(token, parsed.data)
    return Response.json({ ok: true })
  } catch (error) {
    if (!(error instanceof ReviewServiceError)) throw error
    return Response.json(
      { code: error.code, message: error.message },
      {
        status:
          error.code === "NOT_FOUND"
            ? 404
            : error.code === "ALREADY_SUBMITTED"
              ? 409
              : 500,
      }
    )
  }
}
