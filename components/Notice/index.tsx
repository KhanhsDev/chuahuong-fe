import Container from "@/components/Container"

export default function Notice() {
  return (
    <section className="py-12">
      <Container>
        <div className="border-brand-600 bg-brand-50 rounded-2xl border-l-4 p-6">
          <h3 className="text-brand-700 text-lg font-bold">
            Lưu ý trước khi thanh toán
          </h3>
          <ul className="text-ink/80 mt-3 list-disc space-y-1 pl-6 text-base">
            <li>
              Vé chỉ có giá trị trong ngày đã chọn, hết hiệu lực vào cuối ngày.
            </li>
            <li>
              Khách tự ý không đi, đi sai ngày hoặc đến muộn không được hoàn
              tiền hoặc đổi ngày.
            </li>
            <li>
              Bạn cần tới khu vực bán vé tại bến để check-in. Đó là lúc hệ thống
              phân đò cho bạn.
            </li>
            <li>
              Nhập đúng số điện thoại khi đặt vé vì đây là thông tin dùng để tra
              cứu và in vé tại bến.
            </li>
          </ul>
        </div>
      </Container>
    </section>
  )
}
