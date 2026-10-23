import Container from "@/components/Container"

export default function Footer() {
  return (
    <footer className="bg-jade-900 py-10 text-sm text-white/70">
      <Container className="flex flex-col justify-between gap-4 sm:flex-row">
        <p>© 2026 Hệ sinh thái số Chùa Hương. Bán vé điện tử chính thức.</p>
        <p>Đơn vị tư vấn giải pháp: Viettel</p>
      </Container>
    </footer>
  )
}
