import Container from "@/components/Container"
import { IStatistic } from "@/interface/common"
// import BookingForm from "@/components/BookingForm"
import Star from "@/assets/svg/material-symbols-star.svg"
export default function Hero() {
  const statistics: IStatistic[] = [
    {
      id: 1,
      name: "Khách hàng",
      value: "10.000+",
    },
    {
      id: 2,
      name: "Đánh giá",
      value: "4.9/5",
      isRating: true,
    },
    {
      id: 3,
      name: "Đò tham quan",
      value: "50+",
    },
    {
      id: 4,
      name: "Hỗ trợ 24/7",
      value: "100%",
    },
  ]
  return (
    <section className="min-h-[50rem] pt-14 pb-16 text-white bg-hero sm:pt-20">
      <Container className="items-center gap-12">
        <div>
          <p className="mb-3 text-sm font-bold tracking-widest text-[#f2b680] uppercase">
            Vé điện tử chính thức
          </p>
          <h1 className="text-4xl leading-tight font-extrabold sm:text-5xl">
            Đặt vé đò Chùa Hương,{" "}
            <span className="text-[#f2b680]">đến bến là có đò</span>
          </h1>
          <p className="mt-5 max-w-[56rem] text-lg text-white/80">
            Mua vé trực tuyến, check-in tại bến và nhận ngay số hiệu đò cùng số
            điện thoại người lái. Không phải chờ đợi, không phải tự tìm và thỏa
            thuận với chủ đò.
          </p>
          <ul className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-sm font-medium text-white/90">
            <li>✓ 3 tuyến tham quan</li>
            <li>✓ Thanh toán một lần</li>
            <li>✓ Xuất hóa đơn khi cần</li>
          </ul>
        </div>
        <div className="flex justify-between">
          {statistics.map((stat) => (
            <div key={stat.id} className="mt-6">
              <p className="text-[4rem] font-bold text-[#fbc117]">
                {stat.value}{" "}
                {stat.isRating && (
                  <Star className="inline-block text-[#fbc117]" />
                )}
              </p>
              <p className="mt-1 text-sm text-white/90">{stat.name}</p>
            </div>
          ))}
        </div>
        {/* <BookingForm /> */}
      </Container>
      D
    </section>
  )
}
