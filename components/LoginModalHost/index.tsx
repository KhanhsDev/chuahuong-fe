'use client';

import { loginModal, useLoginModalOpen } from '@/hooks/useLoginModal';

import LoginForm from '@/components/LoginForm';
import ModalProvider from '@/components/ModalProvider';

export default function LoginModalHost() {
  const isOpen = useLoginModalOpen();

  return (
    <ModalProvider show={isOpen} onClose={loginModal.close}>
      <LoginForm />
    </ModalProvider>
  );
}
