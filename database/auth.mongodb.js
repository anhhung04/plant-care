db = db.getSiblingDB('plant_care');

/** ========================== USERS ========================== **/
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
                    description: "Role người dùng"
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

/** ========================== GREENHOUSES ========================== **/
db.createCollection('greenhouses', {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            required: ["greenhouse_id", "name", "location"],
            properties: {
                greenhouse_id: {
                    bsonType: "string",
                    description: "UUID của nhà kính, liên kết với PostgreSQL"
                },
                name: {
                    bsonType: "string",
                    description: "Tên nhà kính"
                },
                location: {
                    bsonType: "string",
                    description: "Địa điểm nhà kính"
                },
                created_at: {
                    bsonType: "date",
                    description: "Thời điểm tạo"
                }
            }
        }
    }
});

/** ========================== GREENHOUSE DATA (CẢM BIẾN) ========================== **/
db.createCollection('greenhouse_data', {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            required: ["greenhouse_id", "timestamp", "fields"],
            properties: {
                greenhouse_id: {
                    bsonType: "string",
                    description: "ID của nhà kính liên kết với PostgreSQL"
                },
                timestamp: {
                    bsonType: "date",
                    description: "Thời điểm ghi nhận dữ liệu"
                },
                fields: {
                    bsonType: "array",
                    description: "Danh sách các khu vườn trong nhà kính",
                    items: {
                        bsonType: "object",
                        required: ["garden_id", "name", "sensors"],
                        properties: {
                            garden_id: {
                                bsonType: "string",
                                description: "ID của khu vườn trong PostgreSQL"
                            },
                            name: {
                                bsonType: "string",
                                description: "Tên khu vườn"
                            },
                            sensors: {
                                bsonType: "array",
                                description: "Danh sách các cảm biến trong vườn",
                                items: {
                                    bsonType: "object",
                                    required: ["sensor_id", "type", "value", "unit"],
                                    properties: {
                                        sensor_id: {
                                            bsonType: "string",
                                            description: "UUID của cảm biến (liên kết PostgreSQL)"
                                        },
                                        type: {
                                            enum: ["temperature", "humidity", "light"],
                                            description: "Loại cảm biến"
                                        },
                                        value: {
                                            bsonType: "double",
                                            description: "Giá trị đo được"
                                        },
                                        unit: {
                                            enum: ["C", "%", "lux"],
                                            description: "Đơn vị đo"
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
});

/** ========================== ACCESS TOKENS ========================== **/
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

/** ========================== RSA KEYS ========================== **/
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

/** ========================== QUEUES ========================== **/
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

/** ========================== INDEXES ========================== **/
db.users.createIndex({ "username": 1 }, { unique: true });
db.users.createIndex({ "email": 1 }, { unique: true });
db.access_tokens.createIndex({ "expire_at": 1 }, { expireAfterSeconds: 0 });
db.rsa_keys.createIndex({ "is_active": 1 });
db.queues.createIndex({ "status": 1, "created_at": 1 });
db.greenhouse_data.createIndex({ "greenhouse_id": 1, "timestamp": -1 });

/** ========================== DỮ LIỆU MẪU ========================== **/
db.users.insertOne({
    username: "admin",
    password: "$2a$10$XgXLGk9VqwPZy.XzG5K5.OiR5XG5Y5XGzG5XG5Y5XG5Y5XG5Y5",
    role: "admin",
    fullname: "Administrator",
    email: "admin@example.com",
    greenhouse_access: []
});

db.greenhouses.insertOne({
    greenhouse_id: "550e8400-e29b-41d4-a716-446655440000",
    name: "Nhà kính A",
    location: "Hà Nội, Việt Nam",
    created_at: new Date()
});

db.greenhouse_data.insertOne({
    greenhouse_id: "550e8400-e29b-41d4-a716-446655440000",
    timestamp: new Date(),
    fields: [
        {
            garden_id: "550e8400-e29b-41d4-a716-446655440001",
            name: "Vườn 1",
            sensors: [
                { sensor_id: "550e8400-e29b-41d4-a716-446655440010", type: "temperature", value: 28.5, unit: "C" },
                { sensor_id: "550e8400-e29b-41d4-a716-446655440011", type: "humidity", value: 65.2, unit: "%" },
                { sensor_id: "550e8400-e29b-41d4-a716-446655440012", type: "light", value: 1200, unit: "lux" }
            ]
        }
    ]
});
