import dayjs from "dayjs"

import type {
  ReviewBoat,
  ReviewErrorCode,
  ReviewPayload,
} from "@/interface/common"
import { orders, reviewTokens } from "@/mocks/data"
import { getExistingAssignments } from "@/services/mockCheckinService"

export class ReviewServiceError extends Error {
  constructor(
    public readonly code: ReviewErrorCode,
    message: string
  ) {
    super(message)
    this.name = "ReviewServiceError"
  }
}

interface ReviewMockState {
  submittedTokens: Set<string>
}

const globalForReview = globalThis as typeof globalThis & {
  __chuaHuongReviewMock?: ReviewMockState
}
const mockState =
  globalForReview.__chuaHuongReviewMock ??
  (globalForReview.__chuaHuongReviewMock = {
    submittedTokens: new Set(
      reviewTokens
        .filter((record) => record.submitted)
        .map((record) => record.token)
    ),
  })

function delay() {
  return new Promise<void>((resolve) =>
    setTimeout(resolve, 400 + Math.floor(Math.random() * 401))
  )
}

export async function getReviewByToken(token: string) {
  await delay()
  const record = reviewTokens.find((candidate) => candidate.token === token)
  if (!record) {
    throw new ReviewServiceError(
      "NOT_FOUND",
      "Đường dẫn đánh giá không hợp lệ hoặc đã hết hạn."
    )
  }

  const order = orders.find((candidate) => candidate.id === record.orderId)
  const assignments = getExistingAssignments(record.orderId)
  const boats: ReviewBoat[] =
    assignments && order
      ? assignments.map((assignment) => ({
          assignmentId: assignment.id,
          boat: assignment.boat,
          routeId: order.routeId,
          date: order.date,
        }))
      : record.boats

  return {
    ...record,
    submitted: record.submitted || mockState.submittedTokens.has(token),
    boats: boats.map((boat) => ({
      ...boat,
      date: dayjs(boat.date).format("YYYY-MM-DD"),
    })),
  }
}

export async function submitReview(
  token: string,
  payload: ReviewPayload
): Promise<void> {
  await delay()
  const record = reviewTokens.find((candidate) => candidate.token === token)
  if (!record) {
    throw new ReviewServiceError(
      "NOT_FOUND",
      "Đường dẫn đánh giá không hợp lệ hoặc đã hết hạn."
    )
  }
  if (record.submitted || mockState.submittedTokens.has(token)) {
    throw new ReviewServiceError(
      "ALREADY_SUBMITTED",
      "Đánh giá cho chuyến đi này đã được gửi trước đó."
    )
  }
  const assignments = getExistingAssignments(record.orderId)
  const expectedAssignmentIds =
    assignments?.map((assignment) => assignment.id) ??
    record.boats.map((boat) => boat.assignmentId)
  const receivedAssignmentIds = new Set(
    payload.reviews.map((review) => review.assignmentId)
  )
  if (
    payload.reviews.length !== expectedAssignmentIds.length ||
    receivedAssignmentIds.size !== expectedAssignmentIds.length ||
    expectedAssignmentIds.some((id) => !receivedAssignmentIds.has(id))
  ) {
    throw new ReviewServiceError(
      "NOT_FOUND",
      "Không tìm thấy thông tin chuyến đò cần đánh giá."
    )
  }
  mockState.submittedTokens.add(token)
}
