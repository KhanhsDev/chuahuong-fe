"use client"

import LoginForm from "@/components/LoginForm"
import ModalProvider from "@/components/ModalProvider"
import { loginModal, useLoginModalOpen } from "@/hooks/useLoginModal"

export default function LoginModalHost() {
  const isOpen = useLoginModalOpen()

  return (
    <ModalProvider show={isOpen} onClose={loginModal.close}>
      <LoginForm />
    </ModalProvider>
  )
}
