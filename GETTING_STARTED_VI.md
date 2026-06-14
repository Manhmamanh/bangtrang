# 🎯 Hướng dẫn Bắt Đầu - TPPO Whiteboard

Chào mừng bạn đến với TPPO Whiteboard - ứng dụng bảng trắng hợp tác thời gian thực cho team brainstorming!

## 🚀 Khởi Động Nhanh (5 phút)

### Cách dễ nhất: Dùng Docker

```bash
# 1. Vào thư mục dự án
cd tppo-whiteboard

# 2. Chạy tất cả (frontend + backend + database)
docker-compose up

# 3. Chờ khoảng 1 phút, rồi mở trình duyệt:
# http://localhost:5173
```

**Xong!** 🎉 Giờ bạn có thể:
1. Tạo tài khoản mới
2. Tạo bảng trắng 
3. Bắt đầu brainstorming

---

## 📝 Hướng dẫn Chi Tiết

### 1️⃣ Tạo Tài Khoản

1. Truy cập **http://localhost:5173**
2. Nhấp **"Sign Up"**
3. Điền thông tin:
   - Email: ví dụ `hoangdq@example.com`
   - Mật khẩu: ghi nhớ mật khẩu của bạn
   - Tên đầy đủ: ví dụ `Hoàng Đức Quân`
4. Nhấp **"Sign Up"**

→ Bạn sẽ tự động được đưa đến trang Boards

### 2️⃣ Tạo Bảng Trắng Đầu Tiên

1. Nhấp nút **"+ Create New Board"**
2. Nhập thông tin:
   - **Tên**: ví dụ "Brainstorm Tháng 6"
   - **Mô tả**: ví dụ "Ý tưởng chiến lược quý 2"
3. Nhấp **"Create"**

→ Board của bạn được tạo! Nhấp vào nó để vào editor

### 3️⃣ Vẽ Trên Canvas

#### Chọn Công Cụ
Ở thanh công cụ trên đầu, chọn:
- **⬚ Select** - Di chuyển/chọn object
- **▭ Rect** - Vẽ hình chữ nhật
- **◯ Circle** - Vẽ hình tròn  
- **A Text** - Viết text
- **📌 Sticky** - Tạo sticky note (ghi ý tưởng)

#### Vẽ
1. Chọn công cụ
2. Kéo chuột trên canvas để vẽ hình
3. Thả chuột để hoàn tất

#### Chỉnh Sửa
- **Di chuyển**: Kéo object đến vị trí mới
- **Xóa**: Chọn object, nhấp 🗑️ Delete
- **Thay đổi màu**: (coming soon)

### 4️⃣ Tính Năng Nâng Cao

#### 🎵 Brainstorm Timer (Đếm ngược + Nhạc)

*(Feature sẽ được thêm vào sidebar)*

- Đặt thời gian (ví dụ 5-10 phút)
- Nhấp ▶ Start
- Nhấp 🔊 bật nhạc lo-fi để tập trung
- Khi hết giờ, có thông báo 🎉

#### 🗳️ Bỏ Phiếu Cho Ý Tưởng (Anonymous Voting)

1. Tạo vài sticky note với các ý tưởng
2. Nhấp nút **"🗳️ Vote"** ở trên
3. Một panel hiện ra với danh sách sticky notes
4. Bỏ phiếu:
   - **👍** = Thích ý tưởng này
   - **👎** = Không thích
5. Bỏ phiếu là **ẩn danh** - không ai biết bạn vote gì

*(Tất cả votes được tính lại, không lưu tên)*

#### 📤 Xuất File

1. Nhấp **"⬇️ Export"**
2. Chọn định dạng:
   - **PNG** - Ảnh (để chia sẻ)
   - **SVG** - Vector (để chỉnh sửa sau)
   - **PDF** - In được

3. File sẽ tự động download

#### 👥 Thêm Người Khác Vào Board

1. Ở sidebar, tìm phần "Members"
2. Nhấp "Add Member"
3. Nhập email của người (ví dụ: manh@f88.vn)
4. Chọn quyền:
   - **Admin** - Toàn quyền
   - **Editor** - Chỉnh sửa
   - **Viewer** - Chỉ xem

→ Họ sẽ nhận email mời

#### 📊 Xem Lịch Sử Thay Đổi

Ở sidebar "History", bạn thấy:
- Ai đã thay đổi gì
- Lúc nào thay đổi
- Chi tiết thay đổi

→ Có thể quay lại version cũ nếu cần

---

## 💡 Gợi Ý Sử Dụng

### Brainstorming Hiệu Quả

1. **Tổ chức ý tưởng**
   - Dùng các vùng canvas khác nhau
   - Dùng màu khác nhau cho các chủ đề

2. **Theo dõi ý tưởng tốt**
   - Dùng Sticky Note Voting
   - Chọn top 3-5 ý tưởng cao nhất

3. **Lưu lại để sau**
   - Export PNG để chia sẻ
   - Lưu link board để xem lại

### Ví Dụ Workflow

```
1. Tạo Board "Q2 Strategy"
2. Mở Brainstorm Timer (10 phút)
3. Mỗi người tạo sticky notes với ý tưởng
4. Sau hết giờ, bắt đầu voting (5 phút)
5. Xem kết quả voting, chọn top ideas
6. Discuss trên top 3 ideas
7. Export kết quả
8. Lưu link để theo dõi lần sau
```

---

## ⚙️ Cấu Hình

### Thay Đổi Thời Gian Brainstorm Timer

*File: `packages/client/src/pages/EditorPage.tsx`*

Tìm dòng:
```typescript
initialMinutes={5}  // Thay 5 thành số phút bạn muốn
```

### Thay Đổi Màu Sắc

*File: `packages/client/src/styles/app.css`*

```css
:root {
  --primary: #1976d2;        /* Màu chính */
  --danger: #d32f2f;         /* Màu xóa */
  --success: #388e3c;        /* Màu thành công */
}
```

---

## 🆘 Vấn Đề & Giải Pháp

| Vấn Đề | Nguyên Nhân | Cách Sửa |
|--------|-----------|---------|
| Không thấy frontend | Server chưa start | Check terminal xem Docker chạy không |
| Không kết nối được | WebSocket lỗi | Reload page F5, check console log |
| Offline không hoạt động | Cache hết | Clear browser data, đăng nhập lại |
| Timer không phát nhạc | Trình duyệt chặn audio | Cho phép audio trong settings trình duyệt |

---

## 🔄 Offline Mode

Bạn có thể **tiếp tục làm việc khi mất kết nối internet!**

### Cách hoạt động:

1. **Offline**: Tất cả thay đổi lưu vào máy tính
2. **Online lại**: Tự động đồng bộ lên server
3. **Xung đột**: Dùng "last-write-wins" (thay đổi sau nhất thắng)

→ Không bao giờ mất dữ liệu! 🔒

---

## 📞 Liên Hệ & Phản Hồi

- **Email**: hangdt@f88.vn
- **Report Bug**: Gửi email với:
  - Mô tả vấn đề
  - Cách tái hiện bug
  - Browser & OS bạn dùng

---

## 📚 Tài Liệu Thêm

- [Hướng dẫn Setup Chi Tiết](./SETUP.md)
- [README (Kỹ thuật)](./README.md)
- [Architecture](./ARCHITECTURE.md) *(sắp tới)*

---

## ✨ Tính Năng Sắp Tới

- [ ] Vẽ tự do (freehand drawing)
- [ ] Chèn ảnh từ URL
- [ ] Chèn video/YouTube
- [ ] Comment & mention (@username)
- [ ] Template library (retrospective, roadmap, etc)
- [ ] Mobile app (iOS/Android)
- [ ] Integrateions (Slack, Jira, Figma)

---

**Happy Brainstorming! 🎨✨**

Chúc bạn có một session brainstorming vui vẻ và sáng tạo!
