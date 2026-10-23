"use client"

import Container from "@/components/Container"
import { Button } from "../ui/button"
import { useModal } from "@/hooks/common/useModal"
import ModalProvider from "../ModalProvider"
import LoginForm from "../LoginForm"

const links = [
  { href: "#tuyen", label: "Tuyến tham quan" },
  { href: "#cach-dat-ve", label: "Cách đặt vé" },
  { href: "#gia-ve", label: "Giá vé" },
  { href: "#faq", label: "Hỏi đáp" },
]

export default function Header() {
  const handleLogin = () => {
    loginModal.handleShow()
  }

  const loginModal = useModal()
  return (
    <>
      <header className="sticky top-0 z-30 border-b border-black/5 bg-[#015959]">
        <Container className="flex h-[6.4rem] items-center justify-between">
          <a
            href="#"
            className="flex items-center gap-2 text-lg font-extrabold text-[#f95d00]"
          >
            <span aria-hidden>⛵</span> Vé đò Chùa Hương
          </a>
          <nav className="hidden gap-8 text-sm font-medium md:flex">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-[#FFFFFF] hover:text-brand-600"
              >
                {l.label}
              </a>
            ))}
          </nav>
          <div className="flex gap-[2rem]">
            <Button className="rounded-full border border-white bg-transparent px-5 py-2.5 text-sm font-bold text-white">
              Đăng ký
            </Button>
            <Button
              className="rounded-full bg-brand-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-700"
              onClick={handleLogin}
            >
              Đăng nhập
            </Button>
          </div>
        </Container>
      </header>
      <ModalProvider show={loginModal.show} onClose={loginModal.handleHide}>
        <LoginForm />
      </ModalProvider>
    </>
  )
}
