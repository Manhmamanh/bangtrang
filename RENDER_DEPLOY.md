# 🚀 Deploy trên Render - TPPO Whiteboard (Bangtrang)

## ✅ Bước 1: Chuẩn Bị

### Yêu cầu
- ✅ GitHub repository (đã có: https://github.com/Manhmamanh/bangtrang)
- ✅ Render.com account (free)
- ✅ render.yaml config (đã có)

### GitHub Setup ✓
- Code đã push lên: `https://github.com/Manhmamanh/bangtrang`

---

## 🔧 Bước 2: Deploy trên Render

### Cách 1: Automatic Deploy từ GitHub (Dễ nhất) ✨

1. **Vào Render Dashboard**
   - Truy cập: https://dashboard.render.com
   - Login/Signup

2. **Tạo PostgreSQL Database**
   - Click "+ New" → "PostgreSQL"
   - **Name:** `bangtrang-db`
   - **Database:** `bangtrang`
   - **User:** `postgres`
   - **Region:** Singapore
   - Plan: Free (nên chọn paid sau, free có limitation)
   - Click "Create Database"
   - ⏳ Chờ ~2 phút để database ready

3. **Deploy Backend API**
   - Click "+ New" → "Web Service"
   - Connect GitHub repo: `Manhmamanh/bangtrang`
   - **Settings:**
     - Name: `bangtrang-api`
     - Root Directory: `packages/server`
     - Runtime: Node
     - Build Command: `npm install && npm run build`
     - Start Command: `npm start`
     - Plan: Free

   - **Environment Variables:**
     ```
     NODE_ENV=production
     PORT=10000
     JWT_SECRET=[Random string - auto-generated]
     JWT_EXPIRE=7d
     DATABASE_URL=[Copy từ Database]
     REDIS_URL=redis://localhost:6379
     ```

   - Click "Create Web Service"
   - ⏳ Chờ build & deploy (~5 phút)

4. **Deploy Frontend**
   - Click "+ New" → "Static Site"
   - Connect GitHub: `Manhmamanh/bangtrang`
   - **Settings:**
     - Name: `bangtrang-web`
     - Build Command: `cd packages/client && npm install && npm run build`
     - Publish Directory: `packages/client/dist`
     - Plan: Free

   - **Environment Variables:**
     ```
     VITE_API_URL=https://bangtrang-api.onrender.com/api
     VITE_WS_URL=wss://bangtrang-api.onrender.com
     ```

   - Click "Create Static Site"
   - ⏳ Chờ build & deploy (~3 phút)

---

## ⚠️ Bước 3: Quan Trọng - Database Setup

Sau khi PostgreSQL ready, bạn cần init schema:

1. **Vào Database Connection**
   - Render Dashboard → PostgreSQL instance
   - Copy `External Database URL`

2. **Connect & Run Migrations**
   ```bash
   # Từ local machine
   psql [DATABASE_URL từ Render]
   
   # Hoặc dùng psql client
   psql -h [host] -U postgres -d bangtrang < packages/server/src/db/init.sql
   ```

3. **Hoặc dùng Render Shell**
   - Render Dashboard → PostgreSQL → "Connect"
   - Chọn "PSQL"
   - Paste SQL từ `packages/server/src/db/init.sql`

---

## 🌐 Bước 4: Verify Deployment

### Kiểm tra URLs
- **Frontend:** `https://bangtrang-web.onrender.com`
- **Backend:** `https://bangtrang-api.onrender.com`
- **Health Check:** `https://bangtrang-api.onrender.com/health`

### Test Login
1. Mở: `https://bangtrang-web.onrender.com`
2. Tạo tài khoản mới
3. Tạo board
4. Vẽ & test features

---

## 📋 Bước 5: Cấu Hình Thêm

### Auto-Deploy từ GitHub
- Mỗi lần push lên main → Render tự rebuild & deploy
- Nhìn logs: Render Dashboard → Service → "Logs"

### Custom Domain (Optional)
- Render Dashboard → Service → Settings
- "Custom Domain" → Thêm domain của bạn
- Update DNS records (hướng dẫn trên Render)

### SSL/HTTPS ✓
- Tự động (Render cung cấp)

---

## 🚨 Lưu Ý - Free Tier Limitations

### PostgreSQL Free
- ⚠️ Spin down sau 15 phút inactivity
- ⚠️ Max 256 MB storage
- ⚠️ Max 2 concurrent connections
- ✅ **Nâng cấp sau** nếu cần production

### Web Service Free
- ⚠️ Spin down sau 15 phút inactivity
- ⚠️ Limit 100GB bandwidth/month
- ✅ Đủ để test

### Redis
- ❌ Render không hỗ trợ Redis free
- ✅ Cấu hình database PostgreSQL thay thế

---

## 🔧 Troubleshooting

### "Service spinning down"
- Free tier auto-stop. Vào trang → auto-wake up
- Giải pháp: Upgrade to Paid plan

### "Build failed"
- Check logs: Dashboard → Service → "Logs"
- Phổ biến: `npm install` fail → xóa `package-lock.json`

### "Database connection error"
- Kiểm tra DATABASE_URL correct
- Check IP allowlist (Render auto-allow)
- Run init.sql script

### "CORS errors"
- Backend cần CORS header
- Update: `packages/server/src/index.ts`
  ```typescript
  app.use(cors({
    origin: 'https://bangtrang-web.onrender.com'
  }));
  ```

---

## 📊 Monitoring

### View Logs
- Render Dashboard → Service → "Logs"
- Real-time updates

### View Metrics
- Render Dashboard → Service → "Metrics"
- CPU, Memory, Network

### Alerts
- Render Dashboard → Account → "Notifications"
- Nhận email khi có issues

---

## 💰 Upgrade to Paid (Recommended)

Sau khi test xong, nâng cấp:

**PostgreSQL Starter**: $15/month
- 1 GB storage
- Unlimited connections
- No auto-suspend

**Web Service Starter**: $7/month
- Full resources
- No auto-suspend

---

## 🎯 Next Steps

1. ✅ Deploy lên Render (làm ngay)
2. ✅ Test features
3. ⚠️ Backup database regularly
4. 💰 Nâng cấp to paid tier khi production
5. 🔐 Setup monitoring & alerts

---

## 📞 Support

- **Render Docs:** https://render.com/docs
- **GitHub:** https://github.com/Manhmamanh/bangtrang
- **Issues:** Create GitHub issue

---

**Happy deploying! 🚀**
