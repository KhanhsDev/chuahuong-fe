/** X: số vé tối đa mỗi lượt mua (= sức chứa đò to). Ban Quản lý cấu hình, đây chỉ là giá trị mặc định cho giao diện. */
export const MAX_TICKETS_PER_ORDER = 15

export type Route = {
  id: string
  name: string
  path: string
  small: number
  large: number
}

export const routes: Route[] = [
  {
    id: "huong-tich",
    name: "Tuyến Hương Tích",
    path: "Bến Yến – Đền Trình Ngũ Nhạc – Bến Trò, Thiên Trù – Động Hương Tích",
    small: 60,
    large: 70,
  },
  {
    id: "long-van",
    name: "Tuyến Long Vân",
    path: "Bến Yến – Chùa và động Long Vân",
    small: 30,
    large: 35,
  },
  {
    id: "tuyet-son",
    name: "Tuyến Tuyết Sơn",
    path: "Bến đò Tuyết Sơn – Chùa Bảo Đài, động Tuyết Sơn",
    small: 30,
    large: 35,
  },
]

/** Bảng giá tham chiếu. Giá chính thức do Ban Quản lý ban hành theo từng ngày. */
export const prices = {
  adult: { weekday: 110000, festival: 85000 },
  child: { weekday: 65000, festival: 65000 },
}

export const steps = [
  {
    title: "Chọn tuyến và ngày đi",
    text: "Chọn một trong ba tuyến, số lượng người lớn, trẻ em và hình thức ghép đò hoặc bao thuyền.",
  },
  {
    title: "Thanh toán một lần",
    text: "Điền họ tên, số điện thoại và thanh toán trực tuyến. Mã đặt vé được gửi qua tin nhắn và email.",
  },
  {
    title: "Check-in tại bến",
    text: "Đến khu vực bán vé, nhập mã đặt vé và số điện thoại. Hệ thống phân đò và in vé cho bạn ngay.",
  },
  {
    title: "Lên đò, quét mã",
    text: "Tìm đúng số hiệu đò ghi trên vé, đưa vé cho người lái quét mã QR rồi lên đường.",
  },
]

export const features = [
  {
    icon: "🎟️",
    title: "Mua vé trước, đỡ xếp hàng",
    text: "Đặt vé từ nhà, tới bến chỉ cần check-in là có đò.",
  },
  {
    icon: "⛵",
    title: "Biết ngay đò của mình",
    text: "Vé in rõ số hiệu đò, số cổng và số điện thoại người lái.",
  },
  {
    icon: "🤝",
    title: "Đi cùng nhau",
    text: "Hệ thống ưu tiên xếp trọn một nhóm lên cùng một đò.",
  },
  {
    icon: "🔒",
    title: "Thanh toán một lần",
    text: "Cả đơn hàng nhiều vé chỉ một giao dịch, có thể xuất hóa đơn.",
  },
  {
    icon: "🚤",
    title: "Bao thuyền riêng",
    text: "Muốn đi riêng gia đình hay nhóm bạn? Chọn bao trọn một đò.",
  },
  {
    icon: "⭐",
    title: "Đánh giá sau chuyến đi",
    text: "Cuối ngày bạn nhận đường dẫn để đánh giá người lái đã chở mình.",
  },
]

export const faqs = [
  {
    q: "Tôi có cần khai tên từng người đi cùng không?",
    a: "Không. Vé là vé ẩn danh. Hệ thống chỉ lưu họ tên và số điện thoại của người mua vé, tức người đại diện đơn hàng.",
  },
  {
    q: "Mỗi lần tôi mua được tối đa bao nhiêu vé?",
    a: "Mỗi số điện thoại mua được tối đa một số vé nhất định trong một lượt, tương ứng sức chứa của một đò. Đoàn đông hơn hãy tách thành nhiều đơn với các người đại diện khác nhau và dặn thành viên đi đúng nhóm của mình.",
  },
  {
    q: "Tôi mất vé hoặc vé không quét được thì sao?",
    a: "Ra quầy bán vé, cung cấp số điện thoại đã dùng khi mua để nhân viên tra cứu và in lại. Vé in lại giữ nguyên số hiệu đò đã phân.",
  },
  {
    q: "Khi nào tôi được hoàn tiền?",
    a: "Khi khu di tích dừng đón khách do thời tiết xấu hoặc lý do từ Ban Quản lý, hoặc khi hệ thống gặp sự cố khiến bạn không sử dụng được dịch vụ. Khách tự ý không đi, đi sai ngày hoặc đến muộn sẽ không được hoàn tiền.",
  },
  {
    q: "Vé trẻ em được kiểm tra thế nào?",
    a: "Người lái đò đối chiếu bằng cảm quan hoặc có thể đề nghị xuất trình căn cước công dân. Nếu dùng sai nhóm đối tượng, bạn sẽ mua bù phần chênh lệch tại quầy.",
  },
  {
    q: "Vé có dùng được vào ngày khác không?",
    a: "Không. Vé chỉ có giá trị trong ngày đã chọn và hết hiệu lực vào cuối ngày.",
  },
]

export const vnd = (n: number) => n.toLocaleString("vi-VN") + " đ"
