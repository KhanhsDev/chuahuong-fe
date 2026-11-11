import { z } from "zod"

import {
  CheckinServiceError,
  confirmCheckin,
  getAssignmentStatus,
  lookupOrder,
} from "@/services/mockCheckinService"

const requestSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("lookup"),
    code: z.string(),
    phone: z.string(),
  }),
  z.object({
    action: z.literal("confirm"),
    orderId: z.string(),
  }),
  z.object({
    action: z.literal("status"),
    orderId: z.string(),
  }),
])

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json(
      { code: "UNKNOWN", message: "Thông tin gửi lên không hợp lệ." },
      { status: 400 }
    )
  }

  const parsed = requestSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json(
      { code: "UNKNOWN", message: "Thông tin gửi lên không hợp lệ." },
      { status: 400 }
    )
  }

  try {
    const result =
      parsed.data.action === "lookup"
        ? await lookupOrder(parsed.data.code, parsed.data.phone)
        : parsed.data.action === "confirm"
          ? await confirmCheckin(parsed.data.orderId)
          : await getAssignmentStatus(parsed.data.orderId)
    return Response.json(result)
  } catch (error) {
    if (!(error instanceof CheckinServiceError)) throw error
    const status =
      error.code === "NOT_FOUND" ? 404 : error.code === "UNKNOWN" ? 500 : 409
    return Response.json(
      {
        code: error.code,
        message: error.message,
        ...(error.order ? { order: error.order } : {}),
      },
      { status }
    )
  }
}
