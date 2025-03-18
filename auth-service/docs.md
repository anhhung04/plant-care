
---

![usecase-Database - mongoDB.drawio.png](attachment:2d475f37-e088-415e-a445-d40c6943a733:usecase-Database_-_mongoDB.drawio.png)

# Tài liệu Thiết kế Database Auth Server

## 1. Tổng quan

Hệ thống Auth Server quản lý xác thực người dùng với 3 entity chính: User, AccessToken và RSA_Keys. Hệ thống sử dụng MongoDB làm cơ sở dữ liệu và JWT kết hợp RSA để xác thực.

## 2. Cấu trúc Database

### 2.1. Collection USERS

Collection quản lý thông tin người dùng trong hệ thống.

### Schema

| Field | Type | Description | Constraints |
| --- | --- | --- | --- |
| UserID | ObjectId | ID tự động của MongoDB | Primary Key |
| Fullname | String | Tên đầy đủ người dùng | Required |
| UserName | String | Tên đăng nhập | Unique |
| Email | String | Email người dùng | Unique |
| password | String | Mật khẩu đã hash | Required |
| Role | String | Vai trò người dùng | Enum: ["admin", "user", etc] |

### Indexes

```jsx
{ "UserName": 1 } // unique
{ "Email": 1 }    // unique

```

### 2.2. Collection ACCESS_TOKENS

Quản lý các JWT token trong hệ thống.

### Schema

| Field | Type | Description | Constraints |
| --- | --- | --- | --- |
| TokenID | ObjectId | ID của token | Primary Key |
| JWT_Token | String | Token JWT | Required |
| expire_at | Date | Thời điểm hết hạn | Required |

### Indexes

```jsx
{ "TokenID": 1 }
{ "expire_at": 1 }, { expireAfterSeconds: 0 }

```

### 2.3. Collection RSA_KEYS

Quản lý cặp khóa RSA dùng để ký và xác thực JWT.

### Schema

| Field | Type | Description | Constraints |
| --- | --- | --- | --- |
| KeyID | ObjectId | ID của cặp khóa | Primary Key |
| private_key | String | Khóa riêng tư RSA | Required |
| public_key | String | Khóa công khai RSA | Required |
| encryption_iv | String | Vector khởi tạo cho mã hóa | Required |
| is_active | Boolean | Trạng thái hoạt động của khóa | Default: true |
| expire_time | Date | Thời điểm hết hạn của khóa | Required |

### Indexes

```jsx
{ "KeyID": 1 }
{ "is_active": 1 }

```

## 3. Mối quan hệ

### 3.1. USER - ACCESS_TOKEN (Generate)

- Quan hệ: One-to-Many (1:N)
- Mô tả: Một user có thể tạo ra nhiều access token
- Cardinality: 1:1 (Mỗi token chỉ thuộc về một user)

### 3.2. USER - RSA_KEYS (Has)

- Quan hệ: One-to-Many (1:N)
- Mô tả: Một user có thể có nhiều cặp khóa RSA
- Cardinality: 1:1 (Mỗi cặp khóa RSA thuộc về một user)

# Tài liệu Thiết kế Database Greenhouse Management System

![usecase-Database - postgres.drawio.png](attachment:3ee23f5d-c5c3-4e77-a1d7-eae2aeee0cd1:usecase-Database_-_postgres.drawio.png)

## 1. Tổng quan

Hệ thống quản lý nhà kính (Greenhouse) cho phép người dùng theo dõi và quản lý các nhà kính, khu vườn và cảm biến. Hệ thống sử dụng PostgreSQL làm cơ sở dữ liệu chính.

## 2. Cấu trúc Database

### 2.1. Bảng USERS

Quản lý thông tin người dùng hệ thống.

### Schema

| Field | Type | Description | Constraints |
| --- | --- | --- | --- |
| UserID | UUID | ID người dùng | Primary Key |
| Fullname | VARCHAR(100) | Tên đầy đủ | Required |
| UserName | VARCHAR(50) | Tên đăng nhập | Unique |
| Email | VARCHAR(100) | Email liên hệ | Unique |
| Role | VARCHAR(20) | Vai trò người dùng | Enum: ["admin", "manager", "user"] |

### 2.2. Bảng GREENHOUSES

Quản lý thông tin các nhà kính.

### Schema

| Field | Type | Description | Constraints |
| --- | --- | --- | --- |
| LandID | UUID | ID nhà kính | Primary Key |
| Hname | VARCHAR(100) | Tên nhà kính | Required |
| Description | TEXT | Mô tả chi tiết |  |
| Status | VARCHAR(20) | Trạng thái hoạt động | Enum: ["active", "inactive", "maintenance"] |
| House_area | DECIMAL | Diện tích nhà kính (m²) | > 0 |
| HLocation | VARCHAR(200) | Vị trí nhà kính | Required |
| Fields | JSONB | Các trường thông tin mở rộng |  |

### 2.3. Bảng GARDENS

Quản lý các khu vườn trong nhà kính.

### Schema

| Field | Type | Description | Constraints |
| --- | --- | --- | --- |
| LandID | UUID | ID khu vườn | Primary Key |
| L_name | VARCHAR(100) | Tên khu vườn | Required |
| Land_area | DECIMAL | Diện tích (m²) | > 0 |
| greenhouse_id | UUID | ID nhà kính chứa | Foreign Key |

### 2.4. Bảng SENSORS

Quản lý các cảm biến trong khu vườn.

### Schema

| Field | Type | Description | Constraints |
| --- | --- | --- | --- |
| SensorID | UUID | ID cảm biến | Primary Key |
| Type | VARCHAR(50) | Loại cảm biến | Required |
| unit | VARCHAR(20) | Đơn vị đo | Required |
| is_active | BOOLEAN | Trạng thái hoạt động | Default: true |
| min_threshold | DECIMAL | Ngưỡng dưới | Required |
| max_threshold | DECIMAL | Ngưỡng trên | Required |
| last_modify | TIMESTAMP | Lần cập nhật cuối | Auto |
| garden_id | UUID | ID khu vườn | Foreign Key |

### 2.5. Bảng ALERTS

Quản lý cảnh báo từ cảm biến.

### Schema

| Field | Type | Description | Constraints |
| --- | --- | --- | --- |
| AlertID | UUID | ID cảnh báo | Primary Key |
| sensor_id | UUID | ID cảm biến | Foreign Key |
| message | TEXT | Nội dung cảnh báo | Required |
| status | VARCHAR(20) | Trạng thái xử lý | Enum: ["new", "processing", "resolved"] |
| time | TIMESTAMP | Thời điểm phát sinh | Auto |

## 3. Mối quan hệ

### 3.1. USER - GREENHOUSES (manage)

- Quan hệ: One-to-Many (1:N)
- Một user có thể quản lý nhiều nhà kính
- Foreign Key: `GREENHOUSES.manager_id` -> `USERS.UserID`

### 3.2. GREENHOUSES - GARDENS (Contains)

- Quan hệ: One-to-Many (1:N)
- Một nhà kính chứa nhiều khu vườn
- Foreign Key: `GARDENS.greenhouse_id` -> `GREENHOUSES.LandID`

### 3.3. GARDENS - SENSORS (Has)

- Quan hệ: One-to-Many (1:N)
- Một khu vườn có nhiều cảm biến
- Foreign Key: `SENSORS.garden_id` -> `GARDENS.LandID`

### 3.4. SENSORS - ALERTS (triggers)

- Quan hệ: One-to-Many (1:N)
- Một cảm biến có thể tạo nhiều cảnh báo
- Foreign Key: `ALERTS.sensor_id` -> `SENSORS.SensorID`dư
