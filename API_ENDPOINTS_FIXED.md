# 🔧 API Endpoints - Frontend vs Backend Comparison

## ✅ Đã sửa các lỗi sau:

### 1. **authService.js**
| Trước (❌ SAI) | Sau (✅ ĐÚNG) | Ghi chú |
|---|---|---|
| `POST /auth/login` | `POST /auth/token` | Endpoint đăng nhập |
| `POST /auth/register` | `POST /users` | Đăng ký user mới |
| `GET /users/my-info` | `GET /users/myInfo` | Lấy thông tin user hiện tại |

### 2. **courseService.js**
| Trước (❌ SAI) | Sau (✅ ĐÚNG) | Ghi chú |
|---|---|---|
| `POST /courses/{id}/enroll` | `POST /courses/{id}/purchase` | Mua/đăng ký khóa học |
| `GET /courses/enrolled` | `GET /courses/my-courses` | Danh sách khóa học đã mua |
| - | `POST /courses/payment/capture` | Xác nhận thanh toán Stripe (mới thêm) |

**⚠️ Các endpoint chưa implement trong backend:**
- `POST /courses/{id}/reviews` - Thêm đánh giá
- `GET /courses/{id}/reviews` - Xem đánh giá
- `POST /reviews/{id}/helpful` - Vote đánh giá hữu ích

### 3. **testService.js**
| Trước (❌ SAI) | Sau (✅ ĐÚNG) | Ghi chú |
|---|---|---|
| `GET /tests/{id}/questions` | `GET /exams/tests/{id}/start` | Bắt đầu làm bài thi |
| - | `GET /exams/tests/{id}/practice?part=...` | Làm bài practice (mới thêm) |
| `POST /tests/{id}/submit` | `POST /exams/submit` | Submit bài thi |
| `GET /tests/{id}/results` | `GET /exams/tests/{id}/my-results` | Lấy kết quả bài thi |
| - | `GET /exams/results/{resultId}` | Lấy kết quả theo ID (mới thêm) |

### 4. **paymentService.js**
| Trước (❌ SAI) | Sau (✅ ĐÚNG) | Ghi chú |
|---|---|---|
| `POST /payments/create` | `POST /courses/{id}/purchase` | Tạo payment session |
| `POST /payments/capture` | `POST /courses/payment/capture` | Xác nhận thanh toán |

**⚠️ Endpoint chưa implement:**
- `GET /payments/history` - Lịch sử thanh toán (dùng `/courses/my-courses` thay thế)

### 5. **progressService.js**
**⚠️ TẤT CẢ endpoints đều chưa implement trong backend:**
- `GET /progress` - Tiến độ học tập
- `GET /progress/history` - Lịch sử làm bài
- `GET /progress/statistics` - Thống kê
- `GET /progress/streak` - Chuỗi ngày học

## 📋 Tổng hợp Endpoints Backend hiện có:

### Authentication (`/auth`)
- ✅ `POST /auth/token` - Đăng nhập
- ✅ `POST /auth/introspect` - Kiểm tra token
- ✅ `POST /auth/logout` - Đăng xuất
- ✅ `POST /auth/refresh` - Làm mới token

### Users (`/users`)
- ✅ `POST /users` - Tạo user mới (đăng ký)
- ✅ `GET /users` - Danh sách users
- ✅ `GET /users/{id}` - Chi tiết user
- ✅ `GET /users/myInfo` - Thông tin user hiện tại
- ✅ `PUT /users/{id}` - Cập nhật user
- ✅ `DELETE /users/{id}` - Xóa user

### Courses (`/courses`)
- ✅ `GET /courses` - Danh sách khóa học
- ✅ `GET /courses/{id}` - Chi tiết khóa học
- ✅ `POST /courses` - Tạo khóa học mới
- ✅ `POST /courses/{id}/purchase` - Mua khóa học
- ✅ `POST /courses/payment/capture` - Xác nhận thanh toán
- ✅ `GET /courses/payment/success` - Callback thành công
- ✅ `GET /courses/my-courses` - Khóa học đã mua
- ✅ `PUT /courses/{id}/publish` - Xuất bản khóa học
- ✅ `PUT /courses/{id}/unpublish` - Hủy xuất bản

### Tests (`/tests`)
- ✅ `GET /tests` - Danh sách tests
- ✅ `GET /tests/{id}` - Chi tiết test
- ✅ `POST /tests` - Tạo test mới
- ✅ `POST /tests/with-files` - Tạo test với file
- ✅ `PUT /tests/{id}` - Cập nhật test
- ✅ `DELETE /tests/{id}` - Xóa test

### Exams (`/exams`)
- ✅ `GET /exams/tests/{id}/start` - Bắt đầu làm full test
- ✅ `GET /exams/tests/{id}/practice?part=...` - Làm bài practice
- ✅ `POST /exams/submit` - Submit bài thi
- ✅ `GET /exams/results/{resultId}` - Kết quả theo ID
- ✅ `GET /exams/tests/{id}/my-results` - Tất cả kết quả của test

### Files (`/api/v1/files`)
- ✅ `POST /api/v1/files/upload/image` - Upload ảnh
- ✅ `POST /api/v1/files/upload/audio` - Upload audio
- ✅ `GET /api/v1/files/{id}` - Lấy file
- ✅ `DELETE /api/v1/files/{id}` - Xóa file

## 🎯 Cần làm gì tiếp theo?

1. **Test lại chức năng đăng nhập** - Endpoint đã được sửa
2. **Kiểm tra các trang sử dụng course/test services** - Có thể có lỗi do thay đổi API
3. **Backend cần implement:**
   - Review system cho courses
   - Progress tracking system
   - Payment history endpoint (nếu cần riêng)

## 🐛 Lỗi đã fix:

**Lỗi OAuth2 CORS:**
- **Nguyên nhân:** Frontend gọi `/auth/login` nhưng backend không có endpoint này
- **Spring Security redirect** về OAuth2 login mặc định
- **Giải pháp:** Sửa endpoint thành `/auth/token`

---
**Cập nhật:** 25/10/2025
**Trạng thái:** ✅ Đã sửa tất cả API endpoints để khớp với backend
