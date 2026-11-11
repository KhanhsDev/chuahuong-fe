export interface IStatistic {
  id: number;
  name: string;
  value: string;
  isRating?: boolean;
}

export type RouteId = 'huong-tich' | 'long-van' | 'tuyet-son';
export type BoatMode = 'shared' | 'charter';

export interface DayPrice {
  adult: number;
  child: number;
}

export interface BookingPayload {
  routeId: RouteId;
  date: string; // yyyy-mm-dd
  mode: BoatMode;
  adults: number;
  children: number;
  buyer: { fullName: string; phone: string; email?: string };
  invoice: null | {
    taxCode: string;
    company: string;
    address: string;
    email: string;
  };
  total: number;
}

export interface BookingFormProps {
  /** Giá theo ngày do BQL cấu hình (lấy từ API). */
  getPrice?: (date: string) => DayPrice;
  /** Phụ phí bao thuyền cho 1 phương tiện, theo ngày. */
  getCharterFee?: (date: string) => number;
  /** X – số vé tối đa mỗi lượt mua (= sức chứa đò to). */
  maxPerOrder?: number;
  onSubmit?: (payload: BookingPayload) => Promise<void> | void;
}

export type CheckinOrderStatus = 'valid' | 'payment-pending' | 'refunded' | 'expired';

export type CheckinErrorCode =
  | 'NOT_FOUND'
  | 'WRONG_DATE'
  | 'EXPIRED'
  | 'REFUNDED'
  | 'PAYMENT_PENDING'
  | 'QUEUE_EMPTY'
  | 'INVALID_INPUT'
  | 'RATE_LIMITED'
  | 'NETWORK'
  | 'UNKNOWN';

export type ReviewErrorCode =
  | 'NOT_FOUND'
  | 'WRONG_DATE'
  | 'EXPIRED'
  | 'REFUNDED'
  | 'PAYMENT_PENDING'
  | 'ALREADY_SUBMITTED'
  | 'INVALID_REVIEW'
  | 'RATE_LIMITED'
  | 'NETWORK'
  | 'UNKNOWN';

export interface CheckinOrder {
  id: string;
  code: string;
  phone: string;
  buyerName: string;
  routeId: RouteId;
  date: string;
  adults: number;
  children: number;
  mode: BoatMode;
  status: CheckinOrderStatus;
  alreadyCheckedIn?: boolean;
}

export interface MockBoat {
  id: string;
  size: 'small' | 'large';
  capacity: number;
  gate: number;
  driverPhone: string;
  queueOrder: number;
}

export interface BoatAssignment {
  id: string;
  qrCode: string;
  boat: MockBoat;
  adults: number;
  children: number;
}

export interface ReviewBoat {
  assignmentId: string;
  boat: MockBoat;
  routeId: RouteId;
  date: string;
}

export interface ReviewRecord {
  assignmentId: string;
  rating: number;
  comment: string;
  tags: string[];
}

export interface ReviewPayload {
  reviews: ReviewRecord[];
}
