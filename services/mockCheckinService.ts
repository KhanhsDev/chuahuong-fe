import dayjs from "dayjs"

import type {
  BoatAssignment,
  CheckinErrorCode,
  CheckinOrder,
  MockBoat,
} from "@/interface/common"
import {
  boats,
  dispatchConfig,
  existingAssignments,
  orders,
} from "@/mocks/data"

export class CheckinServiceError extends Error {
  constructor(
    public readonly code: CheckinErrorCode,
    message: string,
    public readonly order?: CheckinOrder
  ) {
    super(message)
    this.name = "CheckinServiceError"
  }
}

export type AssignmentStatus =
  | { status: "waiting"; estimatedWaitSeconds: number }
  | { status: "assigned"; assignments: BoatAssignment[] }

interface CheckinMockState {
  assignmentsByOrder: Map<string, BoatAssignment[]>
  claimedBoatIds: Set<string>
  waitingStartedAt: Map<string, number>
}

const globalForCheckin = globalThis as typeof globalThis & {
  __chuaHuongCheckinMock?: CheckinMockState
}
const mockState =
  globalForCheckin.__chuaHuongCheckinMock ??
  (globalForCheckin.__chuaHuongCheckinMock = {
    assignmentsByOrder: new Map(Object.entries(existingAssignments)),
    claimedBoatIds: new Set(
      Object.values(existingAssignments)
        .flat()
        .map((assignment) => assignment.boat.id)
    ),
    waitingStartedAt: new Map(),
  })

function delay() {
  return new Promise<void>((resolve) =>
    setTimeout(resolve, 400 + Math.floor(Math.random() * 401))
  )
}

function findOrder(orderId: string) {
  const order = orders.find((candidate) => candidate.id === orderId)
  if (!order) {
    throw new CheckinServiceError("NOT_FOUND", "Không tìm thấy đơn đặt vé.")
  }
  return order
}

function validateOrderStatus(order: CheckinOrder) {
  if (order.status === "payment-pending") {
    throw new CheckinServiceError(
      "PAYMENT_PENDING",
      "Đơn vé đang chờ thanh toán. Vui lòng kiểm tra lại sau.",
      order
    )
  }
  if (order.status === "refunded") {
    throw new CheckinServiceError(
      "REFUNDED",
      "Đơn vé này đã được hoàn. Bạn không thể check-in bằng vé đã hoàn.",
      order
    )
  }
  if (order.status === "expired") {
    throw new CheckinServiceError(
      "EXPIRED",
      "Vé đã hết hạn sử dụng. Vui lòng ra quầy để được hỗ trợ.",
      order
    )
  }
  if (!dayjs(order.date).isSame(dayjs(), "day")) {
    throw new CheckinServiceError(
      "WRONG_DATE",
      "Vé chỉ có giá trị đúng ngày ghi trên vé.",
      order
    )
  }
}

function assignPassengers(
  order: CheckinOrder,
  selectedBoats: MockBoat[],
  ticketCounts: number[]
) {
  let adultsRemaining = order.adults

  return selectedBoats.map((boat, index) => {
    const count = ticketCounts[index]
    const adults = Math.min(adultsRemaining, count)
    const children = count - adults
    adultsRemaining -= adults
    return {
      id: `ticket-${order.code}-${boat.id}`,
      qrCode: `QR-${order.code}-${boat.id}`,
      boat,
      adults,
      children,
    }
  })
}

function planAssignments(order: CheckinOrder): BoatAssignment[] {
  const available = boats
    .filter((boat) => !mockState.claimedBoatIds.has(boat.id))
    .sort((first, second) => first.queueOrder - second.queueOrder)
  const total = order.adults + order.children

  if (order.mode === "charter") {
    const boat = available.find((candidate) => candidate.capacity >= total)
    if (!boat) {
      throw new CheckinServiceError(
        "QUEUE_EMPTY",
        "Hiện không còn đò trống trong hàng đợi."
      )
    }
    return assignPassengers(order, [boat], [total])
  }

  const firstBoat = available[0]
  if (!firstBoat) {
    throw new CheckinServiceError(
      "QUEUE_EMPTY",
      "Hiện không còn đò trống trong hàng đợi."
    )
  }
  if (firstBoat.capacity >= total) {
    return assignPassengers(order, [firstBoat], [total])
  }

  const selectedBoats: MockBoat[] = []
  let availableCapacity = 0
  for (const boat of available) {
    selectedBoats.push(boat)
    availableCapacity += boat.capacity
    if (availableCapacity >= total) break
  }

  if (
    availableCapacity < total ||
    selectedBoats.length < 2 ||
    Math.floor(total / selectedBoats.length) < 2
  ) {
    throw new CheckinServiceError(
      "QUEUE_EMPTY",
      "Hiện chưa đủ đò trống để xếp trọn đoàn."
    )
  }

  const baseCount = Math.floor(total / selectedBoats.length)
  let extraPassengers = total % selectedBoats.length
  const ticketCounts = selectedBoats.map((boat) => {
    const count = baseCount + (extraPassengers > 0 ? 1 : 0)
    if (extraPassengers > 0) extraPassengers -= 1
    if (count > boat.capacity) {
      throw new CheckinServiceError(
        "QUEUE_EMPTY",
        "Hiện chưa thể xếp đoàn vào các đò đang chờ."
      )
    }
    return count
  })
  return assignPassengers(order, selectedBoats, ticketCounts)
}

function storeAssignments(order: CheckinOrder) {
  const assignments = planAssignments(order)
  for (const assignment of assignments) {
    mockState.claimedBoatIds.add(assignment.boat.id)
  }
  mockState.assignmentsByOrder.set(order.id, assignments)
  return assignments
}

export function getExistingAssignments(orderId: string) {
  return mockState.assignmentsByOrder.get(orderId)
}

export async function lookupOrder(
  code: string,
  phone: string
): Promise<CheckinOrder> {
  await delay()
  const order = orders.find(
    (candidate) =>
      candidate.code === code.trim().toUpperCase() &&
      candidate.phone === phone.trim()
  )
  if (!order) {
    throw new CheckinServiceError(
      "NOT_FOUND",
      "Không tìm thấy đơn vé khớp với mã đặt vé và số điện thoại này."
    )
  }
  validateOrderStatus(order)
  return {
    ...order,
    alreadyCheckedIn: mockState.assignmentsByOrder.has(order.id),
  }
}

export async function confirmCheckin(
  orderId: string
): Promise<AssignmentStatus> {
  await delay()
  const order = findOrder(orderId)
  validateOrderStatus(order)
  const existing = mockState.assignmentsByOrder.get(orderId)
  if (existing) return { status: "assigned", assignments: existing }

  if (order.code === "CH2610006") {
    mockState.waitingStartedAt.set(orderId, Date.now())
    return { status: "waiting", estimatedWaitSeconds: 12 }
  }

  return {
    status: "assigned",
    assignments: storeAssignments(order),
  }
}

export async function getAssignmentStatus(
  orderId: string
): Promise<AssignmentStatus> {
  await delay()
  const existing = mockState.assignmentsByOrder.get(orderId)
  if (existing) return { status: "assigned", assignments: existing }

  const order = findOrder(orderId)
  const startedAt = mockState.waitingStartedAt.get(orderId)
  if (
    order.code === "CH2610006" &&
    startedAt !== undefined &&
    Date.now() - startedAt < dispatchConfig.waitForBoatMs
  ) {
    return {
      status: "waiting",
      estimatedWaitSeconds: Math.max(
        1,
        Math.ceil(
          (dispatchConfig.waitForBoatMs - (Date.now() - startedAt)) / 1000
        )
      ),
    }
  }

  return {
    status: "assigned",
    assignments: storeAssignments(order),
  }
}
