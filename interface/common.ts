export interface IStatistic {
  id: number
  name: string
  value: string
  isRating?: boolean
}

export type RouteId = "huong-tich" | "long-van" | "tuyet-son"
export type BoatMode = "shared" | "charter"

export interface DayPrice {
  adult: number
  child: number
}

export interface BookingPayload {
  routeId: RouteId
  date: string // yyyy-mm-dd
  mode: BoatMode
  adults: number
  children: number
  buyer: { fullName: string; phone: string; email?: string }
  invoice: null | {
    taxCode: string
    company: string
    address: string
    email: string
  }
  total: number
}

export interface BookingFormProps {
  /** Giá theo ngày do BQL cấu hình (lấy từ API). */
  getPrice?: (date: string) => DayPrice
  /** Phụ phí bao thuyền cho 1 phương tiện, theo ngày. */
  getCharterFee?: (date: string) => number
  /** X – số vé tối đa mỗi lượt mua (= sức chứa đò to). */
  maxPerOrder?: number
  onSubmit?: (payload: BookingPayload) => Promise<void> | void
}
