db = db.getSiblingDB('plant_care');
db.createCollection('users', {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            required: ["username", "password", "role"],
            properties: {
                username: {
                    bsonType: "string",
                    description: "Tên đăng nhập - bắt buộc và unique"
                },
                fullname: {
                    bsonType: "string",
                    description: "Tên đầy đủ người dùng"
                },
                email: {
                    bsonType: "string",
                    description: "Email người dùng - unique"
                },
                password: {
                    bsonType: "string",
                    description: "Mật khẩu đã hash"
                },
                role: {
                    enum: ["admin", "user"],
                    description: "Vai trò người dùng"
                },
                greenhouse_access: {
                    bsonType: "array",
                    description: "Danh sách ID nhà kính (UUID) được phép truy cập trong PostgreSQL",
                    items: {
                        bsonType: "string",
                        description: "UUID của nhà kính"
                    }
                }
            }
        }
    }
});
db.createCollection('access_tokens', {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            required: ["jwt_token", "expire_at"],
            properties: {
                jwt_token: {
                    bsonType: "string",
                    description: "Token JWT"
                },
                expire_at: {
                    bsonType: "date",
                    description: "Thời điểm hết hạn"
                }
            }
        }
    }
});
db.createCollection('rsa_keys', {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            required: ["private_key", "public_key", "encryption_iv", "is_active", "expire_time"],
            properties: {
                private_key: {
                    bsonType: "string",
                    description: "Khóa riêng tư RSA"
                },
                public_key: {
                    bsonType: "string",
                    description: "Khóa công khai RSA"
                },
                encryption_iv: {
                    bsonType: "string",
                    description: "Vector khởi tạo cho mã hóa"
                },
                is_active: {
                    bsonType: "bool",
                    description: "Trạng thái hoạt động của khóa"
                },
                expire_time: {
                    bsonType: "date",
                    description: "Thời điểm hết hạn của khóa"
                }
            }
        }
    }
});
db.createCollection('queues', {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            properties: {
                greenhouse_id: {
                    bsonType: "objectId",
                    description: "ID của nhà kính"
                },
                task_type: {
                    bsonType: "string",
                    description: "Loại nhiệm vụ"
                },
                status: {
                    bsonType: "string",
                    enum: ["pending", "processing", "completed", "failed"],
                    description: "Trạng thái của nhiệm vụ"
                },
                created_at: {
                    bsonType: "date",
                    description: "Thời điểm tạo"
                }
            }
        }
    }
});
db.users.createIndex({ "username": 1 }, { unique: true });
db.users.createIndex({ "email": 1 }, { unique: true });
db.access_tokens.createIndex({ "expire_at": 1 }, { expireAfterSeconds: 0 });
db.rsa_keys.createIndex({ "is_active": 1 });
db.queues.createIndex({ "status": 1, "created_at": 1 });
db.users.insertOne({
    username: "admin",
    password: "$2a$10$XgXLGk9VqwPZy.XzG5K5.OiR5XG5Y5XGzG5XG5Y5XG5Y5XG5Y5",
    role: "admin",
    fullname: "Administrator",
    email: "admin@example.com",
    greenhouse_access: []
});
