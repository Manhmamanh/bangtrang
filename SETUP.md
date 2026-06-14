# 🚀 Hướng dẫn Setup TPPO Whiteboard

## Yêu cầu hệ thống

- **Docker & Docker Compose** (khuyến nghị)
  - [Cài Docker Desktop](https://www.docker.com/products/docker-desktop)
  
- **Hoặc cài thủ công:**
  - Node.js v20+
  - PostgreSQL 15+
  - Redis 7+

## Cách 1: Setup với Docker (Dễ nhất) ⭐

### Bước 1: Clone và vào thư mục
```bash
cd tppo-whiteboard
```

### Bước 2: Khởi động tất cả service
```bash
docker-compose up
```

Chờ khoảng 1-2 phút cho đến khi thấy:
```
✅ Server running on http://localhost:3000
```

### Bước 3: Mở trình duyệt
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3000
- **Health check:** http://localhost:3000/health

## Cách 2: Setup Thủ công (Máy tính của bạn)

### Bước 1: Setup Database

**Trên macOS (dùng Homebrew):**
```bash
# Cài PostgreSQL
brew install postgresql@15
brew services start postgresql@15

# Tạo database
createdb tppo_whiteboard
psql tppo_whiteboard < packages/server/src/db/init.sql

# Cài Redis
brew install redis
brew services start redis
```

**Trên Windows (dùng WSL):**
```bash
# Cài PostgreSQL & Redis từ Windows Store hoặc Docker
```

### Bước 2: Setup Backend

```bash
cd packages/server

# Copy file env
cp .env.example .env

# Chỉnh sửa .env nếu cần
# DATABASE_URL=postgresql://whiteboard:whiteboard_dev@localhost:5432/tppo_whiteboard
# REDIS_URL=redis://localhost:6379

# Cài dependencies
npm install

# Chạy server
npm run dev

# Server sẽ chạy ở http://localhost:3000
```

### Bước 3: Setup Frontend (Terminal mới)

```bash
cd packages/client

# Copy file env
cp .env.example .env

# Cài dependencies
npm install

# Chạy dev server
npm run dev

# Frontend sẽ chạy ở http://localhost:5173
```

## Sử dụng Whiteboard

### Tạo Tài Khoản
1. Truy cập http://localhost:5173
2. Nhấp "Sign Up"
3. Nhập email, password, tên đầy đủ
4. Nhấp "Sign Up"

### Tạo Whiteboard Mới
1. Sau khi login, nhấp "Create New Board"
2. Nhập tên và mô tả
3. Nhấp "Create"

### Vẽ trên Canvas
1. Chọn công cụ (Rect, Circle, Text, Sticky Note)
2. Kéo chuột trên canvas để vẽ
3. Drag để di chuyển object
4. Chọn object để chỉnh sửa

### Tính năng Nâng cao

**Bỏ phiếu cho Sticky Notes:**
- Nhấp 🗳️ Vote button
- Nhấp 👍 hoặc 👎 trên các sticky note

**Xuất File:**
- Nhấp ⬇️ Export
- Chọn định dạng (PNG, SVG, PDF)

**Xem Lịch Sử:**
- Tất cả hành động đều được lưu tự động
- Có thể view history từ sidebar

## Lệnh Hữu Ích

```bash
# Khởi động tất cả
docker-compose up

# Dừng tất cả
docker-compose down

# Xem logs
docker-compose logs -f server
docker-compose logs -f client

# Xóa database (reset)
docker-compose down -v

# Rebuild images
docker-compose up --build
```

## Vấn Đề Thường Gặp

### Lỗi: "Connection refused on port 5173"
✅ Frontend không start. Check terminal xem có lỗi gì

### Lỗi: "Cannot connect to database"
```bash
# Check database chạy không
psql -U whiteboard -d tppo_whiteboard -c "SELECT 1"

# Hoặc khởi động lại
docker-compose restart postgres
```

### Lỗi: "WebSocket disconnected"
- Kiểm tra server còn chạy không
- Check VITE_WS_URL đúng chưa
- Refresh page

### Slow startup lần đầu
- Database đang init schema
- Chờ 1-2 phút là được

## Database

### Xem dữ liệu
```bash
# Connect vào database
psql -U whiteboard tppo_whiteboard

# Xem các bảng
\dt

# Xem users
SELECT * FROM users;

# Xem boards
SELECT * FROM boards;
```

### Reset database
```bash
docker-compose down -v
docker-compose up
# Database sẽ init lại từ init.sql
```

## Development Tips

### Chỉnh sửa code
- Backend code ở `packages/server/src`
- Frontend code ở `packages/client/src`
- Thay đổi tự động reload (HMR)

### Debug
**Frontend (Browser DevTools):**
- F12 → Console
- Network tab để xem API calls
- Application → IndexedDB để xem offline cache

**Backend:**
- Logs in terminal
- Dùng `console.log()` debug

### Database Migrations
Nếu cần thêm table/column:
1. Edit `packages/server/src/db/init.sql`
2. Reset: `docker-compose down -v`
3. Restart: `docker-compose up`

## Triển khai Production

### Build images
```bash
npm run build
docker-compose -f docker-compose.prod.yml up
```

### Environment variables
1. Copy `.env.example` → `.env.production`
2. Chỉnh sửa các giá trị cho production
3. Dùng strong JWT_SECRET

### Database backups
```bash
# Backup
docker-compose exec postgres pg_dump -U whiteboard tppo_whiteboard > backup.sql

# Restore
psql -U whiteboard tppo_whiteboard < backup.sql
```

## Liên hệ hỗ trợ

📧 Email: hangdt@f88.vn

Có vấn đề? Hãy tạo issue hoặc liên hệ!
