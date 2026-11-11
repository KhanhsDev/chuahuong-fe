'use client';

import PasswordField from '../ui/passwordField';
import { Button } from '@headlessui/react';
import { ErrorMessage, Field, Form, FormikProvider, useFormik } from 'formik';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { loginModal as globalLoginModal } from '@/hooks/useLoginModal';

import { emailHint, type RegisterFormValues, registerSchema, useEmailAvailability } from './config';

const initialValues: RegisterFormValues = {
  email: '',
  name: '',
  phone: '',
  password: '',
  confirmPassword: '',
};

const inputClass = (hasError: boolean, extra = '') =>
  `h-11 w-full rounded-lg border px-3 text-sm text-gray-900 transition outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-600 ${extra} ${
    hasError ? 'border-red-500' : 'border-gray-300'
  }`;

export default function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { register, getRedirectPath } = useAuth();
  const router = useRouter();
  const handleLogin = () => {
    globalLoginModal.open();
  };
  const formik = useFormik<RegisterFormValues>({
    initialValues,
    validationSchema: registerSchema,
    onSubmit: async (values) => {
      try {
        console.log('check values', values);
        await register(values);
      } catch (error) {
        console.log('check err', error);
      }
    },
  });

  const { values, touched, errors, isSubmitting } = formik;
  const emailStatus = useEmailAvailability(values.email);

  const isSubmitDisabled = isSubmitting || emailStatus !== 'available';

  return (
    <FormikProvider value={formik}>
      <div className="mx-auto w-[60rem] rounded-2xl bg-white p-6 shadow-lg sm:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Đăng ký tài khoản</h1>
          <p className="mt-2 text-sm text-gray-500">Nhập thông tin bên dưới để tạo tài khoản.</p>
        </div>

        <Form className="space-y-5" noValidate>
          <div className="">
            <label htmlFor="name" className="text-sm font-medium text-gray-700">
              Họ và tên
            </label>
            <Field
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              placeholder="Nguyễn Văn A"
              className={inputClass(!!(touched.name && errors.name))}
            />
            <ErrorMessage name="name" component="p" className="text-xs text-red-600" />
          </div>

          <div className="">
            <label htmlFor="phone" className="text-sm font-medium text-gray-700">
              Số điện thoại
            </label>
            <Field
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              placeholder="0912345678"
              className={inputClass(!!(touched.phone && errors.phone))}
            />
            <ErrorMessage name="phone" component="p" className="text-xs text-red-600" />
          </div>

          <div>
            <label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email
            </label>
            <Field
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="example@email.com"
              className={inputClass(!!(touched.email && errors.email))}
            />
            <ErrorMessage name="email" component="p" className="text-xs text-red-600" />
            {!(touched.email && errors.email) && (
              <p className={`text-xs ${emailHint[emailStatus].color}`}>
                {emailHint[emailStatus].text}
              </p>
            )}
          </div>

          <div>
            <PasswordField
              name="password"
              label="Mật khẩu"
              placeholder="Nhập mật khẩu"
              show={showPassword}
              onToggle={() => setShowPassword((v) => !v)}
              hasError={!!(touched.password && errors.password)}
            />
          </div>
          <div>
            <PasswordField
              name="confirmPassword"
              label="Xác nhận mật khẩu"
              placeholder="Nhập lại mật khẩu"
              show={showConfirmPassword}
              onToggle={() => setShowConfirmPassword((v) => !v)}
              hasError={!!(touched.confirmPassword && errors.confirmPassword)}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitDisabled}
            className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-emerald-700 px-4 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
          </button>

          <p className="text-center text-sm text-gray-500">
            Đã có tài khoản?{' '}
            <Button
              className="font-semibold text-emerald-700 hover:underline"
              onClick={handleLogin}
            >
              Đăng nhập
            </Button>
          </p>
        </Form>
      </div>
    </FormikProvider>
  );
}
