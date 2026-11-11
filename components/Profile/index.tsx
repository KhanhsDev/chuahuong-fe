'use client';

import {
  RiArrowRightSLine,
  RiCalendarLine,
  RiFileList3Line,
  RiLogoutBoxRLine,
  RiMailLine,
  RiMapPinLine,
  RiPhoneLine,
  RiShieldCheckLine,
  RiUser3Line,
} from '@remixicon/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/hooks/useAuth';
import { useSession } from '@/hooks/useSession';

import Container from '@/components/Container';

const Profile = () => {
  const { user } = useSession();
  const { logout } = useAuth();
  const router = useRouter();

  const displayName = user?.name || 'Du khách';
  const initial = displayName.charAt(0).toUpperCase();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <main className="min-h-screen bg-sand py-8 text-ink sm:py-12">
      <Container className="max-w-[108rem]">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm font-bold text-jade-700 transition-colors hover:text-jade-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-jade-700"
          >
            Trang chủ <RiArrowRightSLine size={18} aria-hidden="true" /> Tài khoản
          </Link>
          <div className="mt-6">
            <p className="text-sm font-extrabold tracking-[0.18em] text-brand-700 uppercase">
              Tài khoản của bạn
            </p>
            <h1 className="mt-2 text-4xl font-black text-jade-900 sm:text-5xl">
              Xin chào, {displayName}
            </h1>
            <p className="mt-3 max-w-2xl text-lg text-ink/70">
              Quản lý thông tin cá nhân và theo dõi những chuyến đi tại Chùa Hương của bạn.
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[28rem_1fr]">
          <aside className="h-fit overflow-hidden rounded-3xl border border-black/5 bg-white shadow-sm">
            <div className="px-6 py-8 text-center text-white bg-hero">
              <div className="mx-auto flex size-24 items-center justify-center rounded-full border-4 border-white/30 bg-brand-500 text-4xl font-black shadow-lg">
                {initial}
              </div>
              <h2 className="mt-4 text-2xl font-extrabold">{displayName}</h2>
              <p className="mt-1 text-sm text-white/75">Thành viên Chùa Hương</p>
            </div>
            <nav className="space-y-1 p-3" aria-label="Điều hướng tài khoản">
              <a
                href="#thong-tin"
                className="flex items-center gap-3 rounded-xl bg-jade-50 px-4 py-3 font-bold text-jade-900"
              >
                <RiUser3Line size={20} aria-hidden="true" />
                Thông tin cá nhân
              </a>
              <Link
                href="/booking"
                className="flex items-center gap-3 rounded-xl px-4 py-3 font-semibold text-ink/70 transition-colors hover:bg-sand hover:text-jade-900"
              >
                <RiFileList3Line size={20} aria-hidden="true" />
                Đặt vé của tôi
              </Link>
              <button
                type="button"
                onClick={() => void handleLogout()}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left font-semibold text-red-700 transition-colors hover:bg-red-50"
              >
                <RiLogoutBoxRLine size={20} aria-hidden="true" />
                Đăng xuất
              </button>
            </nav>
          </aside>

          <div className="space-y-6">
            <section
              id="thong-tin"
              className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm sm:p-8"
            >
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div>
                  <h2 className="text-2xl font-extrabold text-jade-900">Thông tin cá nhân</h2>
                  <p className="mt-1 text-base text-ink/60">Thông tin tài khoản của bạn.</p>
                </div>
              </div>

              <div className="mt-8 grid gap-x-6 gap-y-5 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-bold text-ink/70">Họ và tên</span>
                  <span className="relative mt-2 block">
                    <RiUser3Line
                      className="absolute top-1/2 left-4 -translate-y-1/2 text-ink/40"
                      size={19}
                      aria-hidden="true"
                    />
                    <input
                      value={user?.name ?? 'Chưa cập nhật'}
                      placeholder="Chưa cập nhật"
                      disabled
                      className="h-12 w-full rounded-xl border border-black/10 bg-sand/50 pr-4 pl-11 transition-colors outline-none focus:border-jade-700 focus:ring-4 focus:ring-jade-100 disabled:cursor-not-allowed disabled:opacity-80"
                    />
                  </span>
                </label>
                <label className="block">
                  <span className="text-sm font-bold text-ink/70">Email</span>
                  <span className="relative mt-2 block">
                    <RiMailLine
                      className="absolute top-1/2 left-4 -translate-y-1/2 text-ink/40"
                      size={19}
                      aria-hidden="true"
                    />
                    <input
                      value={user?.email ?? 'Chưa cập nhật'}
                      disabled
                      className="h-12 w-full rounded-xl border border-black/10 bg-sand/50 pr-4 pl-11 outline-none disabled:cursor-not-allowed disabled:opacity-80"
                    />
                  </span>
                </label>
                <label className="block">
                  <span className="text-sm font-bold text-ink/70">Số điện thoại</span>
                  <span className="relative mt-2 block">
                    <RiPhoneLine
                      className="absolute top-1/2 left-4 -translate-y-1/2 text-ink/40"
                      size={19}
                      aria-hidden="true"
                    />
                    <input
                      value={user?.phone ?? 'Chưa cập nhật'}
                      placeholder="Chưa cập nhật"
                      disabled
                      className="h-12 w-full rounded-xl border border-black/10 bg-sand/50 pr-4 pl-11 transition-colors outline-none placeholder:text-ink/35 focus:border-jade-700 focus:ring-4 focus:ring-jade-100 disabled:cursor-not-allowed disabled:opacity-80"
                    />
                  </span>
                </label>
                <label className="block">
                  <span className="text-sm font-bold text-ink/70">Ngày sinh</span>
                  <span className="relative mt-2 block">
                    <RiCalendarLine
                      className="absolute top-1/2 left-4 -translate-y-1/2 text-ink/40"
                      size={19}
                      aria-hidden="true"
                    />
                    <input
                      value={user?.dateOfBirth ?? 'Chưa cập nhật'}
                      disabled
                      className="h-12 w-full rounded-xl border border-black/10 bg-sand/50 pr-4 pl-11 outline-none disabled:cursor-not-allowed disabled:opacity-80"
                    />
                  </span>
                </label>
              </div>
            </section>

            <section className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-jade-100 bg-jade-50 p-6">
                <RiShieldCheckLine size={28} className="text-jade-700" aria-hidden="true" />
                <h2 className="mt-4 text-lg font-extrabold text-jade-900">Tài khoản an toàn</h2>
                <p className="mt-1 text-sm text-ink/70">
                  Thông tin của bạn được bảo mật trong mọi giao dịch.
                </p>
              </div>
              <div className="rounded-3xl border border-brand-100 bg-brand-50 p-6">
                <RiMapPinLine size={28} className="text-brand-600" aria-hidden="true" />
                <h2 className="mt-4 text-lg font-extrabold text-brand-700">
                  Sẵn sàng cho chuyến đi
                </h2>
                <p className="mt-1 text-sm text-ink/70">
                  Khám phá vẻ đẹp thiên nhiên và tâm linh Chùa Hương.
                </p>
              </div>
            </section>
          </div>
        </div>
      </Container>
    </main>
  );
};

export default Profile;
