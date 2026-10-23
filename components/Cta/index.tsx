import Container from "@/components/Container"

export default function Cta() {
  return (
    <section className="bg-jade-600 py-16 text-center text-white">
      <Container>
        <h2 className="text-3xl font-extrabold sm:text-4xl">
          Sẵn sàng cho chuyến đò Chùa Hương?
        </h2>
        <p className="mx-auto mt-3 max-w-[60rem] text-lg text-white/85">
          Đặt vé ngay hôm nay để có chuyến đi thuận lợi và đầy đủ thông tin.
        </p>
        <a
          href="#dat-ve"
          className="mt-8 inline-block rounded-full bg-[#f2b680] px-8 py-3.5 text-base font-bold text-[#2a1a0e] hover:brightness-95"
        >
          Đặt vé ngay
        </a>
      </Container>
    </section>
  )
}
