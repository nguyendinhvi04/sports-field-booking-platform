# 📘 Tài liệu Hướng dẫn API Hệ thống Đặt sân (Toàn tập)

Tài liệu này cung cấp đầy đủ thông tin về các endpoint, phương thức, yêu cầu tham số (Request) và dữ liệu trả về (Response) dành cho bộ phận Frontend và Mobile.

---

## 🏛️ 1. Quy chuẩn Chung (General Rules)

### Cấu trúc Response chuẩn
Tất cả các API đều trả về kết quả theo định dạng JSON thống nhất:

**Thành công (2xx):**
```json
{
  "success": true,
  "message": "Thông báo thành công",
  "data": { ... } // Dữ liệu trả về (Object hoặc Array)
}
```

**Thất bại (4xx, 5xx):**
```json
{
  "success": false,
  "message": "Nội dung thông báo lỗi",
  "errors": { ... } // Chi tiết lỗi validation (nếu có)
}
```

### Xác thực (Authentication)
Dùng JWT Token gửi trong Header:
`Authorization: Bearer <Your_JWT_Token>`

---

## 🔐 2. Xác thực & Tài khoản (Auth & Profiles)

### Đăng nhập (Login)
- **Endpoint**: `/api/auth/login`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "yourpassword"
  }
  ```
- **Response**: Trả về `token` và thông tin cơ bản của `user`.

### Đăng ký (Register)
- **Endpoint**: `/api/auth/register`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "name": "Nguyễn Văn A",
    "email": "a@example.com",
    "phone": "0987654321",
    "password": "password123",
    "role": "USER" // Hoặc "OWNER"
  }
  ```

### Lấy thông tin cá nhân (Profile)
- **Endpoint**: `/api/users/me`
- **Method**: `GET` (Yêu cầu Token)
- **Response**: Trả về chi tiết User, bao gồm avatar, vai trò, ngày tạo.

### Các API Auth khác
| Endpoint | Method | Mô tả |
| :--- | :--- | :--- |
| `/api/auth/forgot-password` | `POST` | Gửi email yêu cầu đặt lại mật khẩu. |
| `/api/auth/reset-password` | `POST` | Đặt lại mật khẩu mới dùng mã token từ email. |
| `/api/auth/change-password` | `POST` | Thay đổi mật khẩu khi đang đăng nhập. |
| `/api/auth/profile` | `PATCH` | Cập nhật thông tin cá nhân (Tên, SĐT...). |

---

## 🏟️ 3. Tìm kiếm & Câu lạc bộ (Public Clubs)

### Tìm kiếm danh sách CLB
- **Endpoint**: `/api/clubs`
- **Method**: `GET`
- **Query Params**: `sport`, `city`, `district`, `surface` (cỏ nhân tạo, sàn gỗ...), `format` (5x5, 7x7...), `limit`.
- **Response**: Mảng danh sách CLB kèm `minPrice`, `rating`, `amenities`.

### Chi tiết Câu lạc bộ (Slug)
- **Endpoint**: `/api/clubs/[slug]`
- **Method**: `GET`
- **Response**: Thông tin chi tiết CLB, danh sách các sân (`courts`), bảng giá (`pricings`) và các khung giờ.

### Sân bóng xung quanh (Nearby)
- **Endpoint**: `/api/clubs/nearby`
- **Method**: `GET`
- **Query Params**: `lat`, `lng`, `dist` (bán kính KM).

---

## 📅 4. Đặt sân - Người dùng (User Bookings)

### Tạo đơn đặt sân (Multi-Court)
- **Endpoint**: `/api/bookings`
- **Method**: `POST` (Yêu cầu Token)
- **Request Body**:
  ```json
  {
    "clubId": "cmn_club_id",
    "timeSlotIds": ["id_slot_1", "id_slot_2"], // Nhiều khung giờ cùng lúc
    "bookerName": "Nguyễn Văn A",
    "bookerPhone": "0987654321",
    "paymentMethod": "VNPAY", // Hoặc BANK_TRANSFER, MOMO, CASH
    "voucherCode": "GIAM20K" // Tùy chọn
  }
  ```
- **Response**: Trả về `bookingId` và `paymentUrl` (nếu dùng cổng thanh toán online).

### Xem lịch sử đơn hàng
- **Endpoint**: `/api/bookings`
- **Method**: `GET` (Yêu cầu Token)
- **Response**: Danh sách các đơn hàng của User.

---

## 🛠️ 5. Quản lý dành cho Chủ sân (Owner Management)

### Danh sách Câu lạc bộ của tôi
- **Endpoint**: `/api/owner/clubs`
- **Method**: `GET`
- **Response**: Mảng danh sách các CLB do mình quản lý.

### Tạo mới Câu lạc bộ
- **Endpoint**: `/api/owner/clubs`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "name": "Sân Bóng Thanh Đa Super",
    "address": "123 Bình Quới",
    "district": "Bình Thạnh",
    "city": "Hồ Chí Minh",
    "phone": "0901234567",
    "slotDuration": 60
  }
  ```

### Quản lý Sân bóng trong CLB
- **Lấy danh sách sân**: `/api/owner/clubs/[clubId]/courts` (`GET`).
- **Tạo sân mới**: `/api/owner/clubs/[clubId]/courts` (`POST`).
  - **Body**:
    ```json
    {
      "name": "Sân 5 - Số 1",
      "sportType": "FOOTBALL",
      "surface": "Cỏ nhân tạo",
      "indoorOutdoor": "OUTDOOR"
    }
    ```

### Đặt sân thủ công (Manual Booking tại quầy)
- **Endpoint**: `/api/owner/clubs/[clubId]/manual-bookings`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "clubId": "cmn_club_id",
    "timeSlotIds": ["id_slot_x"],
    "bookerName": "Khách vãng lai",
    "bookerPhone": "0999000111",
    "isPaid": true
  }
  ```

### Cập nhật Trạng thái & Thanh toán
- **Patch Status**: `/api/owner/bookings/[bookingId]/status` (`PATCH`) - Hủy hoặc Hoàn thành đơn.
- **Confirm Payment**: `/api/owner/bookings/[bookingId]/confirm-payment` (`POST`) - Xác nhận đã nhận tiền mặt/chuyển khoản ngoài hệ thống.

### Quản lý Khách hàng (CRM)
- **Danh sách khách**: `/api/owner/clubs/[clubId]/customers` (`GET`).
- **Cập nhật hạng khách**: `/api/owner/clubs/[clubId]/customers/[userId]` (`PATCH`).

### Quản lý Profile Chủ sân & KYC
- **Cập nhật Profile**: `/api/owner/profile` (`PATCH`).
- **Yêu cầu Onboarding**: `/api/owner/onboarding` (`POST`).

---

## 📂 6. Tiện ích (Utilities)

### Upload hình ảnh (Cloudinary)
- **Endpoint**: `/api/upload`
- **Method**: `POST`
- **Content-Type**: `multipart/form-data`
- **Body**:
  - `file`: (File binary)
  - `type`: Phân loại ảnh để lưu đúng folder. Các loại hợp lệ:
    - `user-avatar`: Ảnh đại diện.
    - `user-kyc`: CCCD (dùng `entityId` là "front" hoặc "back").
    - `club-logo`, `club-cover`, `club-gallery`.
    - `court-image`.
    - `payment-proof`: Ảnh bill chuyển khoản.
  - `entityId`: (Tùy chọn) ID của Club hoặc Court để hệ thống tự cập nhật vào DB sau khi upload xong.
- **Response**: Trả về `url` ảnh an toàn dùng để hiển thị.

---
