import { useEffect, useState } from 'react';
import * as yup from 'yup';

import axiosInstance from '@/lib/axiosInstance';
import { buildQueryParams } from '@/lib/utils';

import { ApiResponse } from '@/hooks/global';
import { useDebounce } from '@/hooks/useDebounce';

export const registerSchema = yup.object({
  email: yup
    .string()
    .trim()
    .required('Vui lòng nhập email')
    .email('Email không đúng định dạng')
    .max(255, 'Email không được vượt quá 255 ký tự'),

  name: yup
    .string()
    .trim()
    .required('Vui lòng nhập họ và tên')
    .max(255, 'Họ và tên không được vượt quá 255 ký tự'),

  phone: yup
    .string()
    .required('Vui lòng nhập số điện thoại')
    .matches(/^(?:\+84|0)[35789][0-9]{8}$/, 'Số điện thoại Việt Nam không hợp lệ'),

  password: yup
    .string()
    .required('Vui lòng nhập mật khẩu')
    .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
    .max(128, 'Mật khẩu không được vượt quá 128 ký tự')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!*%?&])[A-Za-z\d@$!*%?&]+$/,
      'Mật khẩu phải có chữ hoa, chữ thường, chữ số và ký tự đặc biệt (@$!*%?&)',
    ),

  confirmPassword: yup
    .string()
    .required('Vui lòng xác nhận mật khẩu')
    .oneOf([yup.ref('password')], 'Mật khẩu xác nhận không khớp'),
});

export type RegisterFormValues = yup.InferType<typeof registerSchema>;

type EmailCheckStatus = 'idle' | 'checking' | 'available' | 'taken' | 'error';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const emailHint: Record<EmailCheckStatus, { text: string; color: string }> = {
  idle: {
    text: 'Email được sử dụng để đăng nhập và liên hệ.',
    color: 'text-gray-500',
  },
  checking: {
    text: 'Đang kiểm tra email...',
    color: 'text-gray-500',
  },
  available: {
    text: 'Email có thể sử dụng.',
    color: 'text-green-600',
  },
  taken: {
    text: 'Email này đã được đăng ký.',
    color: 'text-red-600',
  },
  error: {
    text: 'Không thể kiểm tra email. Vui lòng thử lại.',
    color: 'text-amber-600',
  },
};

export const useEmailAvailability = (email: string): EmailCheckStatus => {
  const debouncedEmail = useDebounce(email, 600);

  const [result, setResult] = useState<{
    email: string;
    status: EmailCheckStatus;
  }>({ email: '', status: 'idle' });

  useEffect(() => {
    if (!EMAIL_REGEX.test(debouncedEmail)) return;

    const controller = new AbortController();

    setResult({ email: debouncedEmail, status: 'checking' });

    axiosInstance<ApiResponse<number>>(
      `/api/v1/auth/count-email?${buildQueryParams({
        email: debouncedEmail,
      })}`,
      { signal: controller.signal },
    )
      .then((res) => {
        if (controller.signal.aborted) return;

        setResult({
          email: debouncedEmail,
          status: res.data?.body === 0 ? 'available' : 'taken',
        });
      })
      .catch(() => {
        if (controller.signal.aborted) return;

        setResult({ email: debouncedEmail, status: 'error' });
      });

    return () => controller.abort();
  }, [debouncedEmail]);

  if (!EMAIL_REGEX.test(email)) return 'idle';

  // Đang chờ debounce hoặc chưa có kết quả cho email hiện tại.
  if (email !== debouncedEmail || result.email !== email) {
    return 'checking';
  }

  return result.status;
};
