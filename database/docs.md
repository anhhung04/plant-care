# Database Guide

## Prerequisites
- Docker và Docker Compose đã được cài đặt

## Các bước thiết lập

1. Clone repository và di chuyển vào thư mục database:
```bash
git clone <repository_url>
cd database
```

2. Tạo file `.env` từ template:
```bash
# Copy template
cp .env.example .env

# Hoặc tạo mới với nội dung
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=your_database
```

3. Cách chạy
## Cách 1: Chạy trực tiếp từ thư mục database

```bash
# Di chuyển vào thư mục database
cd database

# Khởi chạy container
docker-compose up -d
```

## Cách 2: Chạy từ thư mục root của project

```bash
# Đứng tại thư mục root của project
docker-compose up database -d
```

4. Truy cập vào database:
```bash
docker exec -it postgres-db psql -U postgres
```

## Connection String
```
postgresql://postgres:your_secure_password@localhost:5432/your_database
```

## Các lệnh khác

Kiểm tra logs:
```bash
docker-compose logs -f
```

Dừng container:
```bash
docker-compose down
```

Xóa volume data:
```bash
docker-compose down -v
```

## Lưu ý
- Đảm bảo port 5432 không bị conflict

