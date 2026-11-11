import type { BoatAssignment, CheckinOrder, MockBoat, ReviewBoat } from '@/interface/common';
import dayjs from 'dayjs';

const today = dayjs().format('YYYY-MM-DD');

export const dispatchConfig = {
  capacities: {
    small: 11,
    large: 15,
  },
  waitForBoatMs: 12_000,
  pollIntervalMs: 5_000,
};

function createBoat(
  id: string,
  size: MockBoat['size'],
  gate: number,
  queueOrder: number,
): MockBoat {
  return {
    id,
    size,
    capacity: dispatchConfig.capacities[size],
    gate,
    driverPhone: `090000${id}`,
    queueOrder,
  };
}

export const boats: MockBoat[] = [
  createBoat('0001', 'small', 1, 1),
  createBoat('0002', 'small', 2, 2),
  createBoat('0003', 'small', 3, 3),
  createBoat('0004', 'large', 4, 4),
  createBoat('0005', 'small', 5, 5),
  createBoat('0006', 'large', 6, 6),
  createBoat('0007', 'small', 1, 7),
  createBoat('0008', 'large', 2, 8),
  createBoat('0009', 'small', 3, 9),
  createBoat('0010', 'large', 4, 10),
  createBoat('0011', 'small', 5, 11),
  createBoat('0012', 'large', 6, 12),
];

export const orders: CheckinOrder[] = [
  {
    id: 'order-0001',
    code: 'CH2610001',
    phone: '0912345678',
    buyerName: 'Nguyễn Minh Anh',
    routeId: 'huong-tich',
    date: today,
    adults: 3,
    children: 1,
    mode: 'shared',
    status: 'valid',
  },
  {
    id: 'order-0002',
    code: 'CH2610002',
    phone: '0987654321',
    buyerName: 'Trần Quốc Bảo',
    routeId: 'huong-tich',
    date: today,
    adults: 10,
    children: 3,
    mode: 'shared',
    status: 'valid',
  },
  {
    id: 'order-0003',
    code: 'CH2610003',
    phone: '0901112223',
    buyerName: 'Lê Thu Hà',
    routeId: 'long-van',
    date: today,
    adults: 4,
    children: 1,
    mode: 'charter',
    status: 'valid',
  },
  {
    id: 'order-0004',
    code: 'CH2610004',
    phone: '0933444555',
    buyerName: 'Phạm Đức Long',
    routeId: 'tuyet-son',
    date: dayjs().add(1, 'day').format('YYYY-MM-DD'),
    adults: 2,
    children: 0,
    mode: 'shared',
    status: 'valid',
  },
  {
    id: 'order-0005',
    code: 'CH2610005',
    phone: '0944555666',
    buyerName: 'Đỗ Ngọc Lan',
    routeId: 'huong-tich',
    date: today,
    adults: 2,
    children: 1,
    mode: 'shared',
    status: 'valid',
  },
  {
    id: 'order-0006',
    code: 'CH2610006',
    phone: '0955666777',
    buyerName: 'Vũ Hoàng Nam',
    routeId: 'long-van',
    date: today,
    adults: 2,
    children: 0,
    mode: 'shared',
    status: 'valid',
  },
  {
    id: 'order-0007',
    code: 'CH2610007',
    phone: '0966777888',
    buyerName: 'Bùi Mai Phương',
    routeId: 'huong-tich',
    date: today,
    adults: 2,
    children: 0,
    mode: 'shared',
    status: 'payment-pending',
  },
  {
    id: 'order-0008',
    code: 'CH2610008',
    phone: '0977888999',
    buyerName: 'Hoàng Việt Sơn',
    routeId: 'tuyet-son',
    date: today,
    adults: 2,
    children: 0,
    mode: 'shared',
    status: 'refunded',
  },
  {
    id: 'order-0009',
    code: 'CH2610009',
    phone: '0988999000',
    buyerName: 'Ngô Thanh Tâm',
    routeId: 'huong-tich',
    date: dayjs().subtract(1, 'day').format('YYYY-MM-DD'),
    adults: 2,
    children: 0,
    mode: 'shared',
    status: 'expired',
  },
];

export const existingAssignments: Record<string, BoatAssignment[]> = {
  'order-0005': [
    {
      id: 'ticket-CH2610005-0012',
      qrCode: 'QR-CH2610005-0012',
      boat: boats[11],
      adults: 2,
      children: 1,
    },
  ],
};

export interface MockReviewToken {
  token: string;
  orderId: string;
  boats: ReviewBoat[];
  submitted: boolean;
}

function reviewBoat(
  boatIndex: number,
  assignmentId: string,
  routeId: ReviewBoat['routeId'],
): ReviewBoat {
  return {
    assignmentId,
    boat: boats[boatIndex],
    routeId,
    date: today,
  };
}

export const reviewTokens: MockReviewToken[] = [
  {
    token: 'k7Qm2Vx9aP4nR8tY3wL6cB1d',
    orderId: 'order-0001',
    boats: [reviewBoat(0, 'ticket-CH2610001-0001', 'huong-tich')],
    submitted: false,
  },
  {
    token: 'N4pZ8cT2mK6vX1qR9aB3dF7h',
    orderId: 'order-0002',
    boats: [
      reviewBoat(1, 'ticket-CH2610002-0002', 'huong-tich'),
      reviewBoat(2, 'ticket-CH2610002-0003', 'huong-tich'),
    ],
    submitted: false,
  },
  {
    token: 'b5Hn9Wq3sJ7xC2mL8pR4vT6a',
    orderId: 'order-0003',
    boats: [reviewBoat(3, 'ticket-CH2610003-0004', 'long-van')],
    submitted: true,
  },
];
