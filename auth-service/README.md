    # Auth Service

    Dịch vụ xác thực (Authentication Service) cho hệ thống Plant Care, sử dụng JWT với thuật toán RSA và MongoDB để lưu trữ dữ liệu.

    ## Tính năng

    - Đăng nhập: Xác thực người dùng và cấp JWT token
    - JWT: Sử dụng thuật toán RSA để ký và xác thực token
    - Public Key Endpoint: Cung cấp public key để các service khác có thể xác thực token
    - Middleware: Xác thực JWT và kiểm tra quyền truy cập
    - MongoDB: Lưu trữ thông tin người dùng và RSA keys
    - Bảo mật: Mã hóa private key trước khi lưu vào MongoDB

    ## Cài đặt

    ### Sử dụng Docker Compose

    1. Clone repository:
    ```bash
    git clone https://github.com/your-repo/plant-care.git
    cd plant-care/auth-service
    ```

    2. Chạy với Docker Compose:
    ```bash
    docker-compose up -d
    ```

    Điều này sẽ khởi động cả Auth Service và MongoDB.

    ### Cài đặt thủ công

    1. Clone repository:
    ```bash
    git clone https://github.com/your-repo/plant-care.git
    cd plant-care/auth-service
    ```

    2. Cài đặt dependencies:
    ```bash
    go mod download
    ```

    3. Cài đặt và chạy MongoDB:
    ```bash
    # Cài đặt MongoDB theo hướng dẫn tại: https://www.mongodb.com/docs/manual/installation/
    # Hoặc chạy với Docker:
    docker run -d -p 27017:27017 --name mongodb mongo:latest
    ```

    4. Chạy service:
    ```bash
    go run main.go
    ```

    ## Cấu hình

    Bạn có thể cấu hình service bằng các biến môi trường:

    - `MONGO_URI`: URI kết nối đến MongoDB (mặc định: `mongodb://localhost:27017`)
    - `SECRET_KEY`: Khóa bí mật để mã hóa private key (mặc định: `plant-care-auth-service-secret-key-2023`)

    ## API Endpoints

    ### Công khai

    - `POST /login`: Đăng nhập và nhận JWT token
    - Request body: `{"username": "admin", "password": "admin123"}`
    - Response: `{"token": "jwt_token", "message": "đăng nhập thành công"}`

    - `GET /public-key`: Lấy public key để xác thực JWT token
    - Response: Public key dưới dạng PEM

    ### Yêu cầu xác thực

    - `GET /auth/user-info`: Lấy thông tin người dùng từ token
    - Header: `Authorization: Bearer jwt_token`
    - Response: `{"id": "user_id", "username": "admin", "role": "admin"}`

    ### Yêu cầu quyền admin

    - `GET /admin/`: Truy cập trang admin
    - Header: `Authorization: Bearer jwt_token`
    - Response: `{"message": "Chào mừng đến với trang admin"}`

    ## Cách sử dụng JWT trong các service khác

    1. Lấy public key từ endpoint `/public-key`
    2. Sử dụng public key để xác thực JWT token trong header `Authorization`
    3. Trích xuất thông tin người dùng từ JWT claims

    ## Cấu trúc dữ liệu MongoDB

    ### Collection: users

    ```json
    {
    "_id": ObjectId,
    "username": String,
    "passwordHash": String,
    "role": String,
    "createdAt": Date,
    "updatedAt": Date
    }
    ```

    ### Collection: keys

    ```json
    {
    "_id": String,
    "privateKey": String, // Đã mã hóa với AES-256-GCM
    "publicKey": String,
    "encryptionIV": String, // IV cho AES
    "createdAt": Date,
    "updatedAt": Date
    }
    ```

    ## Bảo mật RSA Keys

    Auth Service sử dụng các biện pháp bảo mật sau để bảo vệ RSA keys:

    1. **Lưu trữ trong MongoDB**: Thay vì lưu trữ keys trong hệ thống tệp tin, keys được lưu trữ trong MongoDB, giúp dễ dàng quản lý và sao lưu.

    2. **Mã hóa Private Key**: Private key được mã hóa bằng AES-256-GCM trước khi lưu vào MongoDB.

    3. **Secret Key**: Sử dụng một secret key để mã hóa private key. Secret key có thể được cấu hình thông qua biến môi trường.

    4. **Nonce ngẫu nhiên**: Mỗi lần mã hóa đều sử dụng nonce ngẫu nhiên, đảm bảo rằng cùng một private key sẽ tạo ra ciphertext khác nhau mỗi lần mã hóa.

    5. **Base64 Encoding**: Ciphertext và nonce được mã hóa base64 trước khi lưu vào MongoDB.

    ## Tài khoản mặc định

    - Admin: username=`admin`, password=`admin123`
    - User: username=`user`, password=`user123`

    Các tài khoản mặc định sẽ được tự động tạo khi khởi động service nếu chưa có người dùng nào trong database.

    ## Hướng dẫn test API

    Bạn có thể sử dụng các công cụ như cURL, Postman, hoặc các thư viện HTTP client để test API của Auth Service.

    ### Test với cURL

    #### 1. Đăng nhập và lấy token

    ```bash
    curl -X POST http://localhost:8080/login \
    -H "Content-Type: application/json" \
    -d '{"username": "admin", "password": "admin123"}'
    ```

    Kết quả trả về sẽ có dạng:

    ```json
    {
    "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
    "message": "đăng nhập thành công"
    }
    ```

    Lưu lại token để sử dụng cho các request tiếp theo.

    #### 2. Lấy thông tin người dùng

    ```bash
    curl -X GET http://localhost:8080/auth/user-info \
    -H "Authorization: Bearer YOUR_TOKEN_HERE"
    ```

    Kết quả trả về:

    ```json
    {
    "id": "user_id",
    "username": "admin",
    "role": "admin"
    }
    ```

    #### 3. Truy cập trang admin

    ```bash
    curl -X GET http://localhost:8080/admin \
    -H "Authorization: Bearer YOUR_TOKEN_HERE"
    ```

    Kết quả trả về:

    ```json
    {
    "message": "Chào mừng đến với trang admin"
    }
    ```

    #### 4. Lấy public key

    ```bash
    curl -X GET http://localhost:8080/public-key
    ```

    ### Test với Postman

    1. **Tạo một collection mới** cho Auth Service

    2. **Thiết lập biến môi trường**:
    - `base_url`: http://localhost:8080
    - `token`: (để trống, sẽ được cập nhật sau khi đăng nhập)

    3. **Tạo request đăng nhập**:
    - Method: POST
    - URL: {{base_url}}/login
    - Body (raw, JSON): `{"username": "admin", "password": "admin123"}`
    - Trong tab Tests, thêm script để lưu token:
        ```javascript
        var jsonData = pm.response.json();
        pm.environment.set("token", jsonData.token);
        ```

    4. **Tạo request lấy thông tin người dùng**:
    - Method: GET
    - URL: {{base_url}}/auth/user-info
    - Authorization: Bearer Token, Token: {{token}}

    5. **Tạo request truy cập trang admin**:
    - Method: GET
    - URL: {{base_url}}/admin
    - Authorization: Bearer Token, Token: {{token}}

    6. **Tạo request lấy public key**:
    - Method: GET
    - URL: {{base_url}}/public-key

    ### Test với MongoDB

    #### Sử dụng Docker

    ```bash
    # Kết nối đến MongoDB container
    docker exec -it mongo mongosh

    # Chọn database
    use plant_care_auth

    # Liệt kê tất cả người dùng
    db.users.find().pretty()

    # Tìm người dùng theo username
    db.users.findOne({username: "admin"})

    # Kiểm tra RSA keys
    db.keys.find().pretty()
    ```

    #### Sử dụng MongoDB trực tiếp (không qua Docker)

    Nếu bạn đã cài đặt MongoDB trực tiếp trên máy, bạn có thể sử dụng MongoDB Compass (GUI) hoặc mongosh (CLI) để kiểm tra dữ liệu:

    ##### Sử dụng MongoDB Compass

    1. Tải và cài đặt [MongoDB Compass](https://www.mongodb.com/products/compass)
    2. Kết nối đến MongoDB với URI: `mongodb://localhost:27017`
    3. Chọn database `plant_care_auth`
    4. Chọn collection `users` để xem danh sách người dùng
    5. Sử dụng chức năng Filter để tìm kiếm người dùng cụ thể:
    ```json
    { "username": "admin" }
    ```
    6. Chọn collection `keys` để xem RSA keys

    ##### Sử dụng mongosh (MongoDB Shell)

    ```bash
    # Khởi động MongoDB Shell
    mongosh

    # Chọn database
    use plant_care_auth

    # Liệt kê tất cả người dùng
    db.users.find().pretty()

    # Tìm người dùng theo username
    db.users.findOne({username: "admin"})

    # Kiểm tra số lượng người dùng
    db.users.countDocuments()

    # Kiểm tra cấu trúc của một người dùng
    db.users.findOne()

    # Tìm người dùng theo vai trò
    db.users.find({role: "admin"}).pretty()

    # Kiểm tra thời gian tạo người dùng
    db.users.find().sort({createdAt: -1}).pretty()

    # Kiểm tra RSA keys
    db.keys.find().pretty()
    ```

    ##### Thực hiện các thao tác CRUD cơ bản

    ```bash
    # Thêm người dùng mới (không nên thêm trực tiếp vì password chưa được hash)
    # Chỉ sử dụng cho mục đích test
    db.users.insertOne({
    username: "test_user",
    passwordHash: "password_hash_here",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date()
    })

    # Cập nhật thông tin người dùng
    db.users.updateOne(
    { username: "test_user" },
    { $set: { role: "admin", updatedAt: new Date() } }
    )

    # Xóa người dùng
    db.users.deleteOne({ username: "test_user" })
    ```

    ### Kiểm tra JWT Token

    Bạn có thể sử dụng trang web [jwt.io](https://jwt.io/) để kiểm tra nội dung của JWT token:

    1. Dán token vào phần "Encoded" trên trang jwt.io
    2. Lấy public key từ endpoint `/public-key`
    3. Dán public key vào phần "Verify Signature" để xác thực token
