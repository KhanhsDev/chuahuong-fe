'use client';
import { Button } from '../ui/button';
import { useRouter } from 'next/navigation';

import { useModal } from '@/hooks/common/useModal';
import { loginModal as globalLoginModal } from '@/hooks/useLoginModal';
import { useSession } from '@/hooks/useSession';

import Container from '@/components/Container';

import ModalProvider from '../ModalProvider';
import RegisterForm from '../RegisterForm';

import UserIcon from '@/assets/svg/material-symbols-person.svg';

const links = [
  { href: '#tuyen', label: 'Tuyến tham quan' },
  { href: '#cach-dat-ve', label: 'Cách đặt vé' },
  { href: '#gia-ve', label: 'Giá vé' },
  { href: '#faq', label: 'Hỏi đáp' },
];
const Header = () => {
  const router = useRouter();
  const handleLogin = () => {
    globalLoginModal.open();
  };

  const { isAuthenticated, isHydrated, user } = useSession();
  const handleRegister = () => {
    registerModal.handleShow();
  };
  const registerModal = useModal();
  return (
    <>
      <header className="sticky top-0 z-30 border-b border-black/5 bg-[#015959]">
        <Container className="flex h-[6.4rem] items-center justify-between">
          <a href="#" className="flex items-center gap-2 text-lg font-extrabold text-[#f95d00]">
            <span aria-hidden>⛵</span> Vé đò Chùa Hương
          </a>
          <nav className="hidden gap-8 text-sm font-medium md:flex">
            {links.map((l) => (
              <a key={l.href} href={l.href} className="text-[#FFFFFF] hover:text-brand-600">
                {l.label}
              </a>
            ))}
          </nav>
          {!isHydrated ? null : isAuthenticated ? (
            <span
              className="flex cursor-pointer items-center gap-2 text-sm font-bold text-white"
              onClick={() => {
                router.push('/profile');
              }}
            >
              <UserIcon /> {user?.name || 'Tài khoản'}
            </span>
          ) : (
            <div className="flex gap-[2rem]">
              <Button
                className="rounded-full border border-white bg-transparent px-5 py-2.5 text-sm font-bold text-white"
                onClick={handleRegister}
              >
                Đăng ký
              </Button>
              <Button
                className="rounded-full bg-brand-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-700"
                onClick={handleLogin}
              >
                Đăng nhập
              </Button>
            </div>
          )}
        </Container>
      </header>
      <ModalProvider show={registerModal.show} onClose={registerModal.handleHide}>
        <RegisterForm />
      </ModalProvider>
    </>
  );
};
export default Header;
