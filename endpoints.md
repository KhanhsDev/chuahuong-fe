# Danh sách API – Hệ sinh thái số Chùa Hương

Nguồn: Tài liệu tư vấn giải pháp v4.0 (Viettel). Quy ước: `/api/v1/...`, JSON, ID dạng UUID, thời gian ISO 8601 (UTC+7), tiền tệ VND (số nguyên).

## 0. Quy ước chung

- **Base path:** `/api/v1`
- **Auth:** `Authorization: Bearer <access_token>` (trừ nhóm `public`).
- **Phân nhóm path theo tác nhân:**

| Prefix                   | Tác nhân                                | Auth                         |
| ------------------------ | --------------------------------------- | ---------------------------- |
| `/api/v1/public/...`     | Du khách (website bán vé, web check-in) | Không (hoặc mã đặt vé + SĐT) |
| `/api/v1/counter/...`    | Nhân viên quầy vé / hỗ trợ khu in vé    | JWT, role `counter_staff`    |
| `/api/v1/driver/...`     | Người lái đò (app)                      | JWT, role `driver`           |
| `/api/v1/supervisor/...` | Kiểm soát viên hỗ trợ tại bến           | JWT, role `supervisor`       |
| `/api/v1/admin/...`      | BQL, HTX, kế toán, quản trị hệ thống    | JWT + RBAC                   |
| `/api/v1/webhooks/...`   | Cổng thanh toán, camera AI              | Chữ ký / API key             |

- **Response chuẩn:**

```json
{
  "success": true,
  "data": {},
  "error": null,
  "meta": { "page": 1, "page_size": 20, "total": 100 }
}
```

```json
{
  "success": false,
  "data": null,
  "error": { "code": "TICKET_ALREADY_USED", "message": "Vé đã sử dụng" }
}
```

- **Idempotency:** các API tạo đơn, thanh toán, quét vé, hoàn tiền nhận header `Idempotency-Key`.
- **Nguyên tắc nghiệp vụ cần giữ trong API:**
  1. Vé ẩn danh, chỉ lưu họ tên + SĐT người mua.
  2. Số liệu chi trả lấy từ **bản ghi quét vé**, không lấy từ kết quả phân đò.
  3. Chặn cứng sức chứa tại thời điểm quét.
  4. Vé đoàn quét 1 lần thì toàn bộ số vé trong đó tính là đã sử dụng.
  5. In lại vé giữ nguyên mã QR gốc, không sinh mã mới.
  6. Mọi tham số (giá, sức chứa, giới hạn X, thời gian chờ Y, phụ phí bao thuyền) lấy từ cấu hình, không hardcode.

---

## 1. Xác thực & phiên đăng nhập (Auth)

| Method | Path                                | Mô tả                                                      |
| ------ | ----------------------------------- | ---------------------------------------------------------- |
| POST   | `/api/v1/auth/admin/login`          | Đăng nhập web quản trị / quầy vé (username + password)     |
| POST   | `/api/v1/auth/driver/login`         | Người lái đò đăng nhập bằng SĐT + mật khẩu                 |
| POST   | `/api/v1/auth/driver/login-face`    | Người lái đò đăng nhập bằng xác thực khuôn mặt             |
| POST   | `/api/v1/auth/refresh`              | Làm mới access token                                       |
| POST   | `/api/v1/auth/logout`               | Đăng xuất                                                  |
| GET    | `/api/v1/auth/me`                   | Thông tin tài khoản hiện tại + quyền                       |
| POST   | `/api/v1/auth/change-password`      | Đổi mật khẩu                                               |
| POST   | `/api/v1/auth/driver/register-face` | Đăng ký/cập nhật ảnh khuôn mặt (admin hoặc driver lần đầu) |

---

## 2. Public – Du khách

### 2.1. Danh mục & cấu hình

| Method | Path                                               | Mô tả                                                                             |
| ------ | -------------------------------------------------- | --------------------------------------------------------------------------------- |
| GET    | `/api/v1/public/routes`                            | Danh sách 3 tuyến (Hương Tích, Long Vân, Tuyết Sơn), thời gian đò nhỏ/to          |
| GET    | `/api/v1/public/routes/{route_id}`                 | Chi tiết tuyến                                                                    |
| GET    | `/api/v1/public/pricing?date=YYYY-MM-DD&route_id=` | Bảng giá của đúng ngày (người lớn, trẻ em, phụ phí bao thuyền)                    |
| GET    | `/api/v1/public/pricing/calendar?from=&to=`        | Lịch giá theo khoảng ngày (để hiển thị lịch chọn ngày)                            |
| GET    | `/api/v1/public/config`                            | Cấu hình công khai: giới hạn X vé/lượt, thời hạn thanh toán, điều khoản hoàn tiền |
| GET    | `/api/v1/public/availability?date=&route_id=`      | Trạng thái khu di tích (đang đón khách / tạm dừng do thời tiết)                   |

### 2.2. Đặt vé & thanh toán

| Method | Path                                          | Mô tả                                                |
| ------ | --------------------------------------------- | ---------------------------------------------------- |
| POST   | `/api/v1/public/orders`                       | Tạo đơn hàng (trạng thái vé: chờ thanh toán)         |
| GET    | `/api/v1/public/orders/{order_code}?phone=`   | Tra cứu đơn theo mã đặt vé + SĐT                     |
| POST   | `/api/v1/public/orders/lookup`                | Tra cứu danh sách đơn theo SĐT (kèm OTP nếu cần)     |
| POST   | `/api/v1/public/orders/{order_id}/payments`   | Tạo giao dịch thanh toán, trả về URL cổng thanh toán |
| GET    | `/api/v1/public/payments/{payment_id}/status` | Kiểm tra trạng thái thanh toán                       |
| POST   | `/api/v1/public/orders/{order_id}/cancel`     | Hủy đơn chưa thanh toán                              |
| GET    | `/api/v1/public/orders/{order_id}/tickets`    | Danh sách vé trong đơn (sau thanh toán)              |

**`POST /api/v1/public/orders` – request:**

```json
{
  "visit_date": "2027-02-20",
  "route_id": "uuid",
  "boarding_type": "shared",
  "items": [
    { "passenger_type": "adult", "quantity": 3 },
    { "passenger_type": "child", "quantity": 1 }
  ],
  "buyer": {
    "full_name": "Nguyễn Văn A",
    "phone": "0912345678",
    "email": "a@example.com"
  },
  "invoice": {
    "required": true,
    "company_name": "",
    "tax_code": "",
    "address": "",
    "email": ""
  },
  "accepted_refund_policy": true
}
```

- `boarding_type`: `shared` (ghép đò) | `charter` (bao thuyền, cộng phụ phí).
- Validate: tổng số vé ≤ X (cấu hình); `accepted_refund_policy` bắt buộc `true`; giá lấy theo cấu hình ngày `visit_date`.

### 2.3. Check-in & phân đò (web check-in tự động)

| Method | Path                                               | Mô tả                                                                  |
| ------ | -------------------------------------------------- | ---------------------------------------------------------------------- |
| POST   | `/api/v1/public/checkin/lookup`                    | Nhập mã đặt vé + SĐT, trả về đơn hàng để khách xác nhận                |
| POST   | `/api/v1/public/checkin/confirm`                   | Xác nhận check-in → hệ thống phân đò, phát hành vé đò                  |
| GET    | `/api/v1/public/checkin/{order_id}/assignment`     | Xem kết quả phân đò (số hiệu đò, số cổng, SĐT người lái)               |
| GET    | `/api/v1/public/checkin/{order_id}/ticket`         | Dữ liệu vé đò để in (mã QR, số hiệu đò, cổng, SĐT lái đò, tuyến, ngày) |
| GET    | `/api/v1/public/checkin/{order_id}/waiting-status` | Trạng thái danh sách chờ khi chưa có đò                                |

- Khi hết đò trong hàng đợi: `confirm` trả `status = "waiting"` kèm thời gian chờ dự kiến; khi có đò hệ thống gửi SMS để khách quay lại in vé.
- Vé sai ngày: trả lỗi `TICKET_WRONG_DATE`, kèm ngày ghi trên đơn.

### 2.4. Đánh giá sau hành trình

| Method | Path                             | Mô tả                                                                       |
| ------ | -------------------------------- | --------------------------------------------------------------------------- |
| GET    | `/api/v1/public/reviews/{token}` | Lấy form đánh giá (token ngẫu nhiên theo đơn): danh sách phương tiện đã chở |
| POST   | `/api/v1/public/reviews/{token}` | Gửi đánh giá từng phương tiện (số sao + nhận xét)                           |

---

## 3. Counter – Quầy vé & hỗ trợ khu in vé

| Method | Path                                                | Mô tả                                                                        |
| ------ | --------------------------------------------------- | ---------------------------------------------------------------------------- |
| POST   | `/api/v1/counter/orders`                            | Bán vé tại quầy (nhập họ tên, SĐT, số lượng theo đối tượng, ghép/bao thuyền) |
| POST   | `/api/v1/counter/orders/{order_id}/confirm-payment` | Xác nhận đã thu tiền → phát hành vé, phân đò, gửi lệnh in                    |
| GET    | `/api/v1/counter/orders?phone=&order_code=`         | Tra cứu đơn hỗ trợ khách (mất vé, không nhớ thông tin)                       |
| GET    | `/api/v1/counter/orders/{order_id}`                 | Chi tiết đơn                                                                 |
| POST   | `/api/v1/counter/orders/{order_id}/checkin`         | Check-in hộ khách tại quầy (phân đò, in vé)                                  |
| POST   | `/api/v1/counter/orders/{order_id}/reprint`         | In lại vé (giữ nguyên QR + số hiệu đò đã phân), bắt buộc `reason`            |
| GET    | `/api/v1/counter/tickets/{ticket_id}/print-data`    | Dữ liệu in vé                                                                |
| POST   | `/api/v1/counter/shifts/open`                       | Mở ca bán vé                                                                 |
| GET    | `/api/v1/counter/shifts/current`                    | Thông tin ca hiện tại (số vé đã bán, số tiền phải nộp)                       |
| POST   | `/api/v1/counter/shifts/close`                      | Chốt ca, sinh báo cáo đối chiếu vé bán / tiền phải nộp                       |
| GET    | `/api/v1/counter/queue/summary`                     | Tình trạng hàng đợi đò, số đơn đang chờ phân (hỗ trợ phân luồng)             |
| POST   | `/api/v1/counter/print-incidents`                   | Ghi nhận sự cố máy in vé                                                     |

---

## 4. Driver – Ứng dụng người lái đò

### 4.1. Hồ sơ & trạng thái

| Method | Path                              | Mô tả                                                                           |
| ------ | --------------------------------- | ------------------------------------------------------------------------------- |
| GET    | `/api/v1/driver/profile`          | Thông tin người lái + phương tiện gắn kết (số hiệu, loại đò, sức chứa, kíp, ca) |
| GET    | `/api/v1/driver/schedule?date=`   | Lịch ca/kíp trong ngày của phương tiện                                          |
| GET    | `/api/v1/driver/status`           | Trạng thái hiện tại của phương tiện                                             |
| POST   | `/api/v1/driver/status/waiting`   | Chuyển sang **Chờ khách** (vào hàng đợi, được chia cổng)                        |
| POST   | `/api/v1/driver/status/idle`      | Chuyển sang **Nghỉ** (kết thúc ca)                                              |
| POST   | `/api/v1/driver/status/departed`  | Chuyển **Đã xuất phát** (chốt danh sách khách lượt đi)                          |
| POST   | `/api/v1/driver/status/arrived`   | Chuyển **Đã đến thắng cảnh**                                                    |
| POST   | `/api/v1/driver/status/returning` | Chuyển **Đang chở khách về** (xuất phát lượt về)                                |
| POST   | `/api/v1/driver/status/completed` | Chuyển **Đã trả khách** (kết thúc hành trình, quay lại hàng đợi nếu chọn)       |
| GET    | `/api/v1/driver/gate`             | Cổng chờ được hệ thống chia                                                     |

> Có thể gộp thành `POST /api/v1/driver/status` với body `{ "to": "departed" }`. Backend validate máy trạng thái hợp lệ (Nghỉ → Chờ khách → Đang đón khách → Đã xuất phát → Đã đến thắng cảnh → Đang chở khách về → Đã trả khách).
> Trạng thái **Đang đón khách** do hệ thống tự chuyển khi có đơn được phân.

### 4.2. Nhận khách & quét vé

| Method | Path                                      | Mô tả                                                                                          |
| ------ | ----------------------------------------- | ---------------------------------------------------------------------------------------------- |
| GET    | `/api/v1/driver/assignments/current`      | Danh sách đơn được phân cho phương tiện: tên khách đại diện, số khách theo từng nhóm đối tượng |
| POST   | `/api/v1/driver/scans/outbound`           | Quét QR vé lượt đi                                                                             |
| POST   | `/api/v1/driver/scans/inbound`            | Quét QR vé lượt về                                                                             |
| GET    | `/api/v1/driver/trips/current`            | Chuyến hiện tại: số khách đã quét / sức chứa                                                   |
| GET    | `/api/v1/driver/trips/current/passengers` | Danh sách vé đã quét trong chuyến                                                              |
| GET    | `/api/v1/driver/notifications`            | Thông báo (có khách mới được phân, cảnh báo quá thời gian chờ Y phút)                          |

**`POST /api/v1/driver/scans/outbound` – request:**

```json
{
  "qr_code": "string",
  "scanned_at": "2027-02-20T08:15:00+07:00",
  "device_id": "string"
}
```

**Response thành công:**

```json
{
  "ticket_id": "uuid",
  "order_code": "CH2702-0001",
  "passenger_type": "adult",
  "group_size": 3,
  "vehicle_load": { "current": 9, "capacity": 15 }
}
```

**Mã lỗi quét:** `TICKET_ALREADY_USED`, `TICKET_INVALID`, `TICKET_WRONG_DATE`, `TICKET_WRONG_ROUTE`, `TICKET_NOT_CHECKED_IN`, `VEHICLE_CAPACITY_EXCEEDED` (chặn cứng sức chứa), `VEHICLE_SUSPENDED`, `TRIP_STATUS_INVALID`.

### 4.3. Thống kê cá nhân

| Method | Path                                     | Mô tả                                                                         |
| ------ | ---------------------------------------- | ----------------------------------------------------------------------------- |
| GET    | `/api/v1/driver/stats/summary?from=&to=` | Số lượt khách, số chuyến, doanh thu theo bản ghi quét                         |
| GET    | `/api/v1/driver/history?from=&to=`       | Lịch sử chuyến, lịch sử vi phạm/đình chỉ (vẫn xem được khi bị dừng hoạt động) |
| GET    | `/api/v1/driver/reviews`                 | Đánh giá của du khách đối với phương tiện                                     |

---

## 5. Supervisor – Kiểm soát viên hỗ trợ tại bến

| Method | Path                                                      | Mô tả                                        |
| ------ | --------------------------------------------------------- | -------------------------------------------- |
| GET    | `/api/v1/supervisor/vehicles?gate_id=`                    | Danh sách phương tiện tại các cổng phụ trách |
| GET    | `/api/v1/supervisor/vehicles/{vehicle_id}/assignments`    | Xem đơn đang được phân cho phương tiện       |
| POST   | `/api/v1/supervisor/vehicles/{vehicle_id}/scans/outbound` | Quét vé lượt đi thay người lái               |
| POST   | `/api/v1/supervisor/vehicles/{vehicle_id}/scans/inbound`  | Quét vé lượt về thay người lái               |
| POST   | `/api/v1/supervisor/vehicles/{vehicle_id}/status`         | Chuyển trạng thái thay người lái             |

- Mọi thao tác ghi nhận `acted_by_supervisor_id` + lý do để hậu kiểm.

---

## 6. Admin – Web quản trị

### 6.1. Người dùng & phân quyền (Quản trị hệ thống)

| Method             | Path                                           | Mô tả                                                        |
| ------------------ | ---------------------------------------------- | ------------------------------------------------------------ |
| GET / POST         | `/api/v1/admin/users`                          | Danh sách / tạo người dùng                                   |
| GET / PUT / DELETE | `/api/v1/admin/users/{user_id}`                | Chi tiết / sửa / vô hiệu hóa                                 |
| POST               | `/api/v1/admin/users/{user_id}/reset-password` | Đặt lại mật khẩu                                             |
| GET / POST         | `/api/v1/admin/roles`                          | Danh sách / tạo vai trò                                      |
| PUT                | `/api/v1/admin/roles/{role_id}/permissions`    | Gán quyền cho vai trò                                        |
| GET                | `/api/v1/admin/permissions`                    | Danh mục quyền                                               |
| GET                | `/api/v1/admin/audit-logs`                     | Nhật ký hệ thống (lọc theo người dùng, hành động, thời gian) |

### 6.2. Danh mục nền

| Method       | Path                                        | Mô tả                               |
| ------------ | ------------------------------------------- | ----------------------------------- |
| GET / POST   | `/api/v1/admin/routes`                      | Danh sách / tạo tuyến               |
| PUT          | `/api/v1/admin/routes/{route_id}`           | Sửa tuyến                           |
| GET / POST   | `/api/v1/admin/gates`                       | Danh sách / tạo cổng chờ (theo bến) |
| PUT / DELETE | `/api/v1/admin/gates/{gate_id}`             | Sửa / xóa cổng                      |
| GET / POST   | `/api/v1/admin/docks`                       | Danh sách / tạo bến                 |
| GET / POST   | `/api/v1/admin/vehicle-types`               | Loại phương tiện (đò to / đò nhỏ)   |
| PUT          | `/api/v1/admin/vehicle-types/{id}/capacity` | Cấu hình sức chứa tối đa            |
| GET / POST   | `/api/v1/admin/counters`                    | Quầy vé / máy in                    |

### 6.3. Phương tiện & người lái (khoảng 3.600 phương tiện)

| Method    | Path                                          | Mô tả                                                   |
| --------- | --------------------------------------------- | ------------------------------------------------------- |
| GET       | `/api/v1/admin/vehicles`                      | Danh sách phương tiện (lọc theo kíp, trạng thái, loại)  |
| POST      | `/api/v1/admin/vehicles`                      | Tạo phương tiện (số hiệu 0001–3600, biển số đầu/đuôi)   |
| POST      | `/api/v1/admin/vehicles/import`               | Import hàng loạt từ file (khởi tạo dữ liệu)             |
| GET / PUT | `/api/v1/admin/vehicles/{vehicle_id}`         | Chi tiết / sửa                                          |
| POST      | `/api/v1/admin/vehicles/{vehicle_id}/suspend` | Đưa vào trạng thái dừng hoạt động (kèm lý do, thời hạn) |
| POST      | `/api/v1/admin/vehicles/{vehicle_id}/resume`  | Mở lại hoạt động                                        |
| GET       | `/api/v1/admin/drivers`                       | Danh sách người lái                                     |
| POST      | `/api/v1/admin/drivers`                       | Tạo người lái (gắn 1 phương tiện cố định)               |
| POST      | `/api/v1/admin/drivers/import`                | Import hàng loạt                                        |
| GET / PUT | `/api/v1/admin/drivers/{driver_id}`           | Chi tiết / sửa                                          |
| PUT       | `/api/v1/admin/drivers/{driver_id}/vehicle`   | Đổi phương tiện gắn kết                                 |

### 6.4. Ca & kíp (03 ca × 10 kíp)

| Method     | Path                                     | Mô tả                               |
| ---------- | ---------------------------------------- | ----------------------------------- |
| GET / POST | `/api/v1/admin/crews`                    | Danh sách / tạo kíp                 |
| PUT        | `/api/v1/admin/crews/{crew_id}/vehicles` | Gán phương tiện vào kíp             |
| GET        | `/api/v1/admin/shifts`                   | Danh mục ca                         |
| GET        | `/api/v1/admin/schedules?from=&to=`      | Lịch hoạt động ca/kíp theo ngày     |
| POST       | `/api/v1/admin/schedules`                | Xếp lịch ca/kíp cho một ngày        |
| POST       | `/api/v1/admin/schedules/bulk`           | Xếp lịch hàng loạt theo khoảng ngày |
| PUT        | `/api/v1/admin/schedules/{schedule_id}`  | Điều chỉnh lịch                     |

### 6.5. Cấu hình vận hành (Cán bộ điều hành)

| Method    | Path                                           | Mô tả                                                             |
| --------- | ---------------------------------------------- | ----------------------------------------------------------------- |
| GET       | `/api/v1/admin/settings`                       | Toàn bộ tham số vận hành                                          |
| PUT       | `/api/v1/admin/settings/max-tickets-per-order` | Giới hạn X vé mỗi lượt mua                                        |
| PUT       | `/api/v1/admin/settings/driver-wait-minutes`   | Thời gian chờ Y phút (cảnh báo nhắc xuất phát)                    |
| PUT       | `/api/v1/admin/settings/payment-timeout`       | Thời hạn thanh toán đơn chờ                                       |
| GET       | `/api/v1/admin/pricing?from=&to=`              | Bảng giá theo từng ngày                                           |
| PUT       | `/api/v1/admin/pricing/{date}`                 | Cấu hình giá cho một ngày (người lớn, trẻ em; cho phép giá = 0)   |
| POST      | `/api/v1/admin/pricing/bulk`                   | Cấu hình giá hàng loạt theo khoảng ngày / loại ngày               |
| PUT       | `/api/v1/admin/pricing/charter-surcharge`      | Phụ phí bao thuyền (theo ngày / theo tuyến)                       |
| GET / PUT | `/api/v1/admin/settings/dispatch`              | Tham số thuật toán phân đò                                        |
| POST      | `/api/v1/admin/operations/suspend-day`         | Dừng đón khách (thời tiết xấu, lý do khác) và kích hoạt hoàn tiền |
| POST      | `/api/v1/admin/operations/resume-day`          | Mở lại đón khách                                                  |

### 6.6. Đơn hàng & vé

| Method | Path                                 | Mô tả                                                           |
| ------ | ------------------------------------ | --------------------------------------------------------------- |
| GET    | `/api/v1/admin/orders`               | Danh sách đơn (lọc theo ngày, tuyến, kênh bán, trạng thái, SĐT) |
| GET    | `/api/v1/admin/orders/{order_id}`    | Chi tiết đơn + lịch sử vé + lịch sử phân đò                     |
| GET    | `/api/v1/admin/tickets`              | Danh sách vé                                                    |
| GET    | `/api/v1/admin/tickets/{ticket_id}`  | Chi tiết vé + lịch sử chuyển trạng thái (thời điểm, tác nhân)   |
| GET    | `/api/v1/admin/tickets/reprint-logs` | Nhật ký in lại vé                                               |
| POST   | `/api/v1/admin/tickets/expire`       | (Job) Chuyển vé hết hạn cuối ngày                               |

### 6.7. Hoàn tiền

| Method | Path                                        | Mô tả                                                                       |
| ------ | ------------------------------------------- | --------------------------------------------------------------------------- |
| POST   | `/api/v1/admin/refunds`                     | Bộ phận vận hành lập đề nghị hoàn tiền (lý do, phạm vi áp dụng)             |
| GET    | `/api/v1/admin/refunds`                     | Danh sách đề nghị hoàn tiền                                                 |
| GET    | `/api/v1/admin/refunds/{refund_id}`         | Chi tiết                                                                    |
| POST   | `/api/v1/admin/refunds/{refund_id}/approve` | Lãnh đạo phê duyệt                                                          |
| POST   | `/api/v1/admin/refunds/{refund_id}/reject`  | Từ chối                                                                     |
| POST   | `/api/v1/admin/refunds/{refund_id}/execute` | Kế toán thực hiện hoàn về nguồn thanh toán gốc, cập nhật vé thành "Đã hoàn" |

### 6.8. Giám sát, cảnh báo & vi phạm

| Method     | Path                                               | Mô tả                                                                                                                     |
| ---------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| GET        | `/api/v1/admin/monitoring/dashboard`               | Số liệu gần thời gian thực: lượng khách, doanh thu, số đò theo trạng thái                                                 |
| GET        | `/api/v1/admin/monitoring/vehicles`                | Trạng thái phương tiện theo cổng/bến                                                                                      |
| GET        | `/api/v1/admin/monitoring/queues`                  | Hàng đợi đò theo bến, số đơn chờ phân                                                                                     |
| GET        | `/api/v1/admin/alerts`                             | Danh sách cảnh báo camera (lọc loại: ngoài hệ thống, sai ca/kíp, chở khách không qua hệ thống, hoạt động khi bị đình chỉ) |
| GET        | `/api/v1/admin/alerts/{alert_id}`                  | Chi tiết: ảnh, người lái, biển số, thời điểm                                                                              |
| POST       | `/api/v1/admin/alerts/{alert_id}/dismiss`          | Bỏ qua cảnh báo (kèm lý do)                                                                                               |
| POST       | `/api/v1/admin/alerts/{alert_id}/violation`        | Lưu thành vi phạm để xử lý                                                                                                |
| GET        | `/api/v1/admin/violations`                         | Danh sách vi phạm                                                                                                         |
| POST       | `/api/v1/admin/violations/{violation_id}/sanction` | Áp dụng chế tài (tạm dừng N ngày, đưa phương tiện vào dừng hoạt động)                                                     |
| GET / POST | `/api/v1/admin/sanction-rules`                     | Cấu hình chế tài lũy tiến theo quy định HTX                                                                               |
| GET        | `/api/v1/admin/vehicles/suspended`                 | Danh sách phương tiện đang dừng hoạt động                                                                                 |
| POST       | `/api/v1/admin/diplomatic-trips`                   | Đăng ký chuyến khách ngoại giao (không phát sinh cảnh báo sai, không tính doanh thu)                                      |
| GET        | `/api/v1/admin/diplomatic-trips`                   | Danh sách chuyến ngoại giao                                                                                               |
| GET        | `/api/v1/admin/camera-events`                      | Dữ liệu nhận diện biển số thô                                                                                             |
| GET / POST | `/api/v1/admin/cameras`                            | Quản lý điểm camera (mỗi tuyến một điểm)                                                                                  |

### 6.9. Tài chính, đối soát & chi trả

| Method | Path                                                      | Mô tả                                                         |
| ------ | --------------------------------------------------------- | ------------------------------------------------------------- |
| GET    | `/api/v1/admin/reconciliation/revenue`                    | Đối soát doanh thu bán vé (kênh, loại vé, tuyến, ngày)        |
| GET    | `/api/v1/admin/reconciliation/counter`                    | Đối soát thu tại quầy theo nhân viên/ca, so với tiền thực nộp |
| POST   | `/api/v1/admin/reconciliation/counter/{shift_id}/confirm` | Xác nhận số tiền thực nộp của ca                              |
| POST   | `/api/v1/admin/reconciliation/online-payments/import`     | Import sao kê cổng thanh toán                                 |
| GET    | `/api/v1/admin/reconciliation/online-payments`            | Đối soát đơn hàng với sao kê, phát hiện giao dịch lệch        |
| GET    | `/api/v1/admin/reconciliation/ridership`                  | Sản lượng vận chuyển theo phương tiện / kíp / ngày            |
| GET    | `/api/v1/admin/reconciliation/assigned-vs-scanned`        | Chênh lệch số khách được phân và số khách thực quét           |
| GET    | `/api/v1/admin/reconciliation/tickets`                    | Vé phát hành – đã in – đã quét – không sử dụng                |
| POST   | `/api/v1/admin/revenue-splits`                            | Lập bảng phân chia doanh thu vé trực tuyến theo kỳ            |
| GET    | `/api/v1/admin/revenue-splits`                            | Danh sách bảng phân chia                                      |
| POST   | `/api/v1/admin/revenue-splits/{id}/approve`               | Phê duyệt bảng phân chia                                      |
| POST   | `/api/v1/admin/payouts`                                   | Lập bảng chi trả cho phương tiện theo bản ghi quét            |
| GET    | `/api/v1/admin/payouts`                                   | Danh sách bảng chi trả                                        |
| GET    | `/api/v1/admin/payouts/{payout_id}`                       | Chi tiết                                                      |
| POST   | `/api/v1/admin/payouts/{payout_id}/approve`               | Lãnh đạo phê duyệt bảng chi trả                               |
| POST   | `/api/v1/admin/payouts/{payout_id}/mark-paid`             | Ghi nhận đã chuyển tiền                                       |
| GET    | `/api/v1/admin/invoices`                                  | Danh sách yêu cầu xuất hóa đơn                                |
| POST   | `/api/v1/admin/invoices/{invoice_id}/issue`               | Phát hành / đồng bộ hóa đơn điện tử                           |

### 6.10. Chất lượng dịch vụ

| Method | Path                            | Mô tả                                                   |
| ------ | ------------------------------- | ------------------------------------------------------- |
| GET    | `/api/v1/admin/reviews`         | Danh sách đánh giá (lọc theo phương tiện, ngày, số sao) |
| GET    | `/api/v1/admin/reviews/summary` | Tổng hợp đánh giá theo phương tiện                      |

### 6.11. Báo cáo (phụ lục tài liệu)

Tham số chung: `from`, `to`, hỗ trợ `format=json|xlsx`.

| Method | Path                                    | Mô tả                                                                                    |
| ------ | --------------------------------------- | ---------------------------------------------------------------------------------------- |
| GET    | `/api/v1/admin/reports/revenue`         | Doanh thu theo ngày / tuyến / loại vé / đối tượng / kênh; phụ phí bao thuyền; so sánh kỳ |
| GET    | `/api/v1/admin/reports/traffic`         | Lưu lượng theo khung giờ, vé bán và vé đã in                                             |
| GET    | `/api/v1/admin/reports/transport`       | Lượt khách, số chuyến theo phương tiện / kíp / ngày; tỷ lệ lấp đầy; lượt đi/lượt về      |
| GET    | `/api/v1/admin/reports/dispatch`        | Chênh lệch phân vs quét; tỷ lệ đơn bị tách; thời gian chờ bình quân                      |
| GET    | `/api/v1/admin/reports/printing`        | Số lượt in theo máy/khung giờ; thời gian xử lý; sự cố máy in                             |
| GET    | `/api/v1/admin/reports/reconciliation`  | Tổng hợp đối soát, phân chia, chi trả                                                    |
| GET    | `/api/v1/admin/reports/control`         | Cảnh báo camera, vi phạm đã xử lý, phương tiện đang dừng, in lại vé                      |
| GET    | `/api/v1/admin/reports/service-quality` | Kết quả đánh giá và góp ý                                                                |
| GET    | `/api/v1/admin/reports/system-health`   | Tình trạng thiết bị hiện trường, sự cố, thời gian gián đoạn                              |

---

## 7. Webhooks & tích hợp bên ngoài

| Method | Path                                         | Mô tả                                                                                       |
| ------ | -------------------------------------------- | ------------------------------------------------------------------------------------------- |
| POST   | `/api/v1/webhooks/payment/{provider}`        | IPN / callback từ cổng thanh toán (xác thực chữ ký, idempotent) → chuyển vé sang "Hiệu lực" |
| GET    | `/api/v1/webhooks/payment/{provider}/return` | URL trả về sau thanh toán (redirect về website)                                             |
| POST   | `/api/v1/webhooks/camera/plate-events`       | Camera AI đẩy sự kiện nhận diện biển số (biển số, camera_id, thời điểm, ảnh)                |
| POST   | `/api/v1/webhooks/sms/delivery-report`       | (Tùy chọn) Trạng thái gửi tin nhắn                                                          |

---

## 8. Job / Worker nội bộ (không public API)

Không cần endpoint HTTP, chạy bằng scheduler/queue:

| Job                       | Mô tả                                                                                                   |
| ------------------------- | ------------------------------------------------------------------------------------------------------- |
| `expire-pending-orders`   | Hủy đơn "Chờ thanh toán" quá hạn                                                                        |
| `expire-tickets-eod`      | Chuyển vé chưa dùng thành "Hết hạn" cuối ngày                                                           |
| `dispatch-waiting-orders` | Khi có đò vào hàng đợi, phân cho đơn đang chờ và gửi SMS báo khách                                      |
| `send-review-links-eod`   | Cuối ngày gửi link đánh giá cho khách đã mua vé                                                         |
| `driver-wait-alert`       | Cảnh báo người lái khi quá Y phút chưa xuất phát                                                        |
| `match-camera-events`     | Đối chiếu biển số với đăng ký, lịch ca kíp, bản ghi phân khách/quét vé, trạng thái dừng → sinh cảnh báo |
| `daily-reconciliation`    | Sinh bảng đối soát theo ngày                                                                            |
| `send-sms` / `send-email` | Gửi thông báo xác nhận đặt vé, thông tin đò, báo có đò                                                  |

---

## 9. Thứ tự ưu tiên triển khai đề xuất

1. **Nền tảng:** Auth, danh mục (tuyến, cổng, loại đò), phương tiện, người lái, cấu hình giá/sức chứa/giới hạn X.
2. **Bán vé:** public pricing, orders, payments + webhook, counter orders, in vé.
3. **Check-in & phân đò:** checkin lookup/confirm, thuật toán phân đò, hàng đợi, danh sách chờ.
4. **Vận hành lái đò:** driver status, assignments, scans outbound/inbound, supervisor.
5. **Tài chính:** hoàn tiền, đối soát, phân chia doanh thu, chi trả, hóa đơn.
6. **Giám sát:** camera webhook, cảnh báo, vi phạm, chế tài.
7. **Báo cáo & đánh giá.**

## 10. Các điểm tài liệu chưa quy định rõ (cần chốt trước khi code)

- **Chế độ ngoại tuyến:** tài liệu quyết định không hỗ trợ; khi mất kết nối chuyển sang quy trình thủ công. Cần chốt cách nhập bù dữ liệu sau sự cố (nếu có) để đối soát.
- **Chi trả theo đầu khách phẳng hay theo doanh thu từng nhóm đối tượng:** ảnh hưởng đến cấu trúc bảng `payouts` và dữ liệu scan cần lưu (`passenger_type`, `unit_price`).
- **Tên bên thụ hưởng trong phân chia doanh thu (D.3):** tài liệu chưa liệt kê, cần danh mục `beneficiaries` và tỷ lệ chia.
- **Cổng thanh toán, nhà cung cấp SMS/Zalo, hóa đơn điện tử:** chưa chọn nhà cung cấp, nên path webhook để dạng `{provider}`.
- **Hình thức thu tiền tại quầy:** "theo hình thức BQL cho phép", cần danh mục `payment_methods` cấu hình được.
- **Đăng nhập khuôn mặt:** tài liệu ghi "khuôn mặt hoặc mật khẩu", cần làm rõ phương án xác thực (on-device hay server-side).
