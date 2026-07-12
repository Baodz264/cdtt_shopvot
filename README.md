<div align="center">
  <img src="https://raw.githubusercontent.com/laravel/art/master/logo-lockup/5%20SVG/2%20CMYK/1%20Full%20Color/laravel-logolockup-cmyk-red.svg" width="300" alt="Racket E-Commerce">
  <h1 align="center">Racket Shop E-Commerce 🏸🎾</h1>
  <p align="center">
    <strong>Hệ thống website Thương mại Điện tử chuyên kinh doanh Vợt Thể Thao (Cầu lông, Tennis) với Next.js 16 & Laravel 12</strong>
  </p>

  <p align="center">
    <img src="https://img.shields.io/badge/Next.js-16.0-black?style=for-the-badge&logo=next.js" alt="Next.js">
    <img src="https://img.shields.io/badge/React-19.2-blue?style=for-the-badge&logo=react" alt="React">
    <img src="https://img.shields.io/badge/Laravel-12.0-FF2D20?style=for-the-badge&logo=laravel" alt="Laravel">
    <img src="https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind">
    <img src="https://img.shields.io/badge/PHP-8.2-777BB4?style=for-the-badge&logo=php" alt="PHP">
  </p>
</div>

---

## 📖 Giới thiệu
Đây là một hệ thống website thương mại điện tử chuyên biệt dành riêng cho cửa hàng bán dụng cụ thể thao, đặc biệt là **Vợt Cầu Lông và Tennis**. Được thiết kế theo kiến trúc tách biệt (Headless) giữa Frontend và Backend, hệ thống mang lại trải nghiệm mua sắm mượt mà, tối ưu hóa cho tốc độ tải trang, đồng thời cung cấp các công cụ quản trị mạnh mẽ cho chủ shop.

---

## ✨ Tính năng nổi bật

### 🛍️ Dành cho Khách hàng (Storefront)
- 🔒 **Xác thực & Bảo mật:** Đăng nhập/đăng ký bằng JWT, xác minh email, lấy lại mật khẩu an toàn.
- 🏸 **Danh mục Vợt chuyên sâu:** Hỗ trợ sản phẩm nhiều thuộc tính biến thể riêng biệt của vợt (Trọng lượng 3U/4U, Kích thước cán G4/G5, Độ cứng thân vợt, v.v.).
- 🛒 **Trải nghiệm mua sắm:** Tìm kiếm thông minh, lọc theo thương hiệu (Yonex, Victor, Lining...), giá tiền và thông số kỹ thuật.
- 💳 **Thanh toán trực tuyến:** Tích hợp cổng thanh toán **VNPay**, hỗ trợ mua sắm an toàn, nhanh chóng.
- 🎁 **Khuyến mãi & Voucher:** Săn các mã giảm giá, voucher freeship khi mua vợt hoặc phụ kiện.
- ⭐ **Đánh giá & Tương tác:** Chấm điểm, đánh giá thực tế (có hình ảnh) để giúp người chơi khác chọn được cây vợt ưng ý, thảo luận và trả lời bình luận.
- 🤖 **Trợ lý ảo (Chatbot tư vấn):** Hỗ trợ giải đáp thắc mắc, tư vấn chọn vợt phù hợp với lối chơi (công, thủ, toàn diện) theo thời gian thực.

### 🛠️ Dành cho Quản trị viên (Admin Dashboard)
- 📊 **Thống kê & Báo cáo:** Cung cấp biểu đồ doanh thu trực quan, theo dõi mẫu vợt bán chạy.
- 📦 **Quản lý Kho hàng:** Quản lý phiếu nhập hàng (Imports), theo dõi số lượng tồn kho từng loại biến thể vợt (ví dụ: kho còn bao nhiêu cây Astrox 99 Pro bản 3U).
- 📝 **Quản lý Sản phẩm:** Dễ dàng cấu hình và quản lý các loại Vợt, Phụ kiện, Thương hiệu.
- 🖼️ **Quản lý Giao diện:** Cập nhật Banner sự kiện, Menu, thiết lập giao diện chung.
- 📰 **Tin tức & Kiến thức:** Đăng tải các bài viết review vợt, mẹo đánh cầu lông/tennis chuẩn SEO.

---

## 💻 Công nghệ sử dụng (Tech Stack)

### **Frontend (`/nvdn-frontend`)**
*   **Core:** Next.js 16.0.3, React 19.2.0
*   **Styling:** Tailwind CSS 4, Ant Design 6
*   **Animations:** Framer Motion
*   **Charts:** Chart.js, react-chartjs-2
*   **Realtime:** Socket.io-client
*   **State & Fetching:** Axios, JS-Cookie

### **Backend (`/nvdn-backend`)**
*   **Core:** PHP 8.2, Laravel 12.0
*   **Database:** MySQL
*   **Authentication:** Tymon JWT Auth, Sanctum
*   **Media Storage:** Cloudinary (cloudinary-laravel)

---

## 📂 Cấu trúc thư mục

```text
📦 tttn
 ┣ 📂 nvdn-backend      # RESTful API quản trị và xử lý dữ liệu (Laravel)
 ┃ ┣ 📂 app
 ┃ ┣ 📂 database
 ┃ ┣ 📂 routes          # Cấu hình API endpoints (api.php)
 ┃ ┗ 📜 composer.json
 ┗ 📂 nvdn-frontend     # Giao diện cửa hàng tương tác người dùng (Next.js)
   ┣ 📂 src
   ┣ 📂 public
   ┗ 📜 package.json
```

---

## 🚀 Hướng dẫn cài đặt (Local Development)

### 1. Cài đặt Backend
```bash
cd nvdn-backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
```
*(Yêu cầu cài đặt cấu hình MySQL, tài khoản Cloudinary cho việc lưu trữ ảnh vợt và VNPay trong file `.env`)*

### 2. Cài đặt Frontend
```bash
cd nvdn-frontend
npm install
npm run dev
```
Truy cập `http://localhost:3000` để trải nghiệm cửa hàng.

---

## 📸 Ảnh chụp màn hình (Screenshots)
*(Hãy bổ sung hình ảnh giao diện cửa hàng và trang quản trị tại đây)*

<div align="center">
  <img src="https://via.placeholder.com/800x400.png?text=Trang+Chu+Shop+Vot" alt="Trang chủ Cửa hàng" width="48%">
  <img src="https://via.placeholder.com/800x400.png?text=Chi+Tiet+Vot+Cau+Long" alt="Chi tiết sản phẩm" width="48%">
  <img src="https://via.placeholder.com/800x400.png?text=Trang+Quan+Tri+Dashboard" alt="Quản trị Admin" width="48%">
  <img src="https://via.placeholder.com/800x400.png?text=Tich+Hop+VNPay" alt="Thanh toán VNPAY" width="48%">
</div>

---

## 👨‍💻 Tác giả
- **[Tên của bạn]** - *Sinh viên Thực tập Tốt nghiệp*

Nếu bạn thấy dự án này thú vị, hãy cho mình một ⭐ để ủng hộ nhé!
