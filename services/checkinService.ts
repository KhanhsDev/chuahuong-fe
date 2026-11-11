import type {
  BoatAssignment,
  BoatMode,
  CheckinErrorCode,
  CheckinOrder,
  MockBoat,
  RouteId,
} from '@/interface/common';
import { TicketCheckInResponse } from '@/interface/response';
import { useCallback, useRef } from 'react';
import { z } from 'zod';

import { METHOD } from '@/hooks/global';
import { useMutation } from '@/hooks/swr';

export type { CheckinErrorCode } from '@/interface/common';

export class CheckinServiceError extends Error {
  constructor(
    public readonly code: CheckinErrorCode,
    message: string,
    public readonly order?: CheckinOrder,
  ) {
    super(message);
    this.name = 'CheckinServiceError';
  }
}

const boatSchema = z.object({
  id: z.string(),
  size: z.enum(['small', 'large']),
  capacity: z.number().int(),
  gate: z.number().int(),
  driverPhone: z.string(),
  queueOrder: z.number().int(),
}) satisfies z.ZodType<MockBoat>;

const assignmentSchema = z.object({
  id: z.string(),
  qrCode: z.string(),
  boat: boatSchema,
  adults: z.number().int(),
  children: z.number().int(),
}) satisfies z.ZodType<BoatAssignment>;

const assignmentStatusSchema = z.discriminatedUnion('status', [
  z.object({
    status: z.literal('waiting'),
    estimatedWaitSeconds: z.number().int(),
  }),
  z.object({
    status: z.literal('assigned'),
    assignments: z.array(assignmentSchema),
  }),
]);

const isRouteId = (value: string): value is RouteId =>
  value === 'huong-tich' || value === 'long-van' || value === 'tuyet-son';

const mapRouteId = (routeId: string): RouteId => {
  const normalized = routeId.replaceAll('_', '-');
  if (!isRouteId(normalized)) {
    throw new CheckinServiceError(
      'UNKNOWN',
      'Hệ thống trả về tuyến không hợp lệ. Vui lòng thử lại.',
    );
  }
  return normalized;
};

const mapBoatMode = (mode: TicketCheckInResponse['mode']): BoatMode =>
  mode === 'shared' ? 'shared' : 'charter';

const mapOrderStatus = (status: TicketCheckInResponse['status']): CheckinOrder['status'] =>
  status === 'checked_in' ? 'valid' : status;

const mapOrder = (data: TicketCheckInResponse): CheckinOrder => ({
  ...data,
  phone: '',
  routeId: mapRouteId(data.routeId),
  mode: mapBoatMode(data.mode),
  status: mapOrderStatus(data.status),
});

const parseApiError = (
  error: unknown,
  fallback: CheckinErrorCode = 'UNKNOWN',
): CheckinServiceError => {
  const response = (
    error as {
      response?: {
        status?: number;
        data?: {
          data?: {
            error?: {
              code?: string;
              message?: string;
              details?: Record<string, unknown>;
            };
          };
        };
      };
    }
  ).response;
  const apiError = response?.data?.data?.error;
  const code = apiError?.code;
  const supported: CheckinErrorCode[] = [
    'NOT_FOUND',
    'WRONG_DATE',
    'EXPIRED',
    'REFUNDED',
    'PAYMENT_PENDING',
    'QUEUE_EMPTY',
    'INVALID_INPUT',
    'RATE_LIMITED',
    'NETWORK',
    'UNKNOWN',
  ];
  const safeCode = supported.includes(code as CheckinErrorCode)
    ? (code as CheckinErrorCode)
    : response?.status === 429
      ? 'RATE_LIMITED'
      : fallback;
  const visitDate = apiError?.details?.visitDate;
  const message =
    safeCode === 'NETWORK'
      ? 'Mất kết nối, vui lòng ra quầy hỗ trợ để được xử lý thủ công.'
      : safeCode === 'WRONG_DATE' && visitDate
        ? `Vé chỉ có giá trị đúng ngày ghi trên vé (${String(visitDate)}).`
        : (apiError?.message ?? 'Đã có lỗi xảy ra. Vui lòng thử lại.');
  return new CheckinServiceError(safeCode, message);
};

export const useCheckinService = () => {
  const currentOrderId = useRef('');
  const { trigger: lookupTrigger } = useMutation<TicketCheckInResponse>(
    '/api/v1/user/check-in/lookup',
    {
      url: '/api/v1/user/check-in/lookup',
      method: METHOD.POST,
      noAuth: true,
    },
  );
  const { trigger: confirmTrigger } = useMutation<z.infer<typeof assignmentStatusSchema>>(
    '/api/v1/user/check-in/orders/confirm',
    {
      url: () =>
        `/api/v1/user/check-in/orders/${encodeURIComponent(currentOrderId.current)}/confirm`,
      method: METHOD.POST,
      noAuth: true,
    },
  );
  const { trigger: assignmentTrigger } = useMutation<z.infer<typeof assignmentStatusSchema>>(
    '/api/v1/user/check-in/orders/assignment',
    {
      url: () =>
        `/api/v1/user/check-in/orders/${encodeURIComponent(currentOrderId.current)}/assignment`,
      method: METHOD.GET,
      noAuth: true,
    },
  );

  const lookupOrder = useCallback(
    async (code: string, phone: string) => {
      try {
        const response = await lookupTrigger({
          code: code.trim().toUpperCase(),
          phone: phone.trim(),
        });
        return mapOrder(response.data);
      } catch (error) {
        if (error instanceof CheckinServiceError) throw error;
        throw parseApiError(error);
      }
    },
    [lookupTrigger],
  );

  const confirmCheckin = useCallback(
    async (orderId: string) => {
      currentOrderId.current = orderId;
      try {
        const response = await confirmTrigger();
        const result = assignmentStatusSchema.safeParse(response.data);
        if (!result.success)
          throw new CheckinServiceError('UNKNOWN', 'Dữ liệu phân đò không hợp lệ.');
        return result.data;
      } catch (error) {
        if (error instanceof CheckinServiceError) throw error;
        throw parseApiError(error);
      }
    },
    [confirmTrigger],
  );

  const getAssignmentStatus = useCallback(
    async (orderId: string) => {
      currentOrderId.current = orderId;
      try {
        const response = await assignmentTrigger();
        const result = assignmentStatusSchema.safeParse(response.data);
        if (!result.success)
          throw new CheckinServiceError('UNKNOWN', 'Dữ liệu phân đò không hợp lệ.');
        return result.data;
      } catch (error) {
        if (error instanceof CheckinServiceError) throw error;
        throw parseApiError(error);
      }
    },
    [assignmentTrigger],
  );

  return { lookupOrder, confirmCheckin, getAssignmentStatus };
};

export type AssignmentStatus =
  | { status: 'waiting'; estimatedWaitSeconds: number }
  | { status: 'assigned'; assignments: BoatAssignment[] };
