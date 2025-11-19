

## 🚀 Công nghệ sử dụng

- ⚙️ Express JS
- ⛑️ TypeScript
- 🐬 MySQL
- 🧩 Node JS

---

## 📂 Cấu trúc thư mục

```bash
src/
├── App/
│   ├── Controllers/     ← Xử lý request/response, gọi service
│   ├── Middlewares/     ← Middleware cho bảo mật, log, validate,...
│   └── Models/          ← Định nghĩa dữ liệu hoặc schema DB
├── Config/          ← Cấu hình hệ thống (env, db, jwt, ...)
├── generated
│   └── prisma       ← File sinh ra bởi Prisma (schema.prisma, migrations, client)
├── Routes/          ← Khai báo route → gọi controller
├── Services/        ← Logic nghiệp vụ, thao tác với DB/API
├── utils/           ← Hàm tiện ích chung
└── index.ts         ← Điểm bắt đầu server (khởi chạy Express)
```

---

## 📦 Cài đặt

```bash

# Cài dependency
npm install

# Chạy development server
npm run dev
```

---

## 🧪 Các tính năng đã có

 (Đang cập nhật)_

---

