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

db.createCollection('greenhouses', {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            required: ["location", "fields"],
            properties: {
                location: {
                    bsonType: "string",
                    description: "Vị trí của nhà kính"
                },
                name: {
                    bsonType: "string",
                    description: "Tên nhà kính"
                },
                page: {
                    bsonType: "int",
                    description: "Số trang hiển thị"
                },
                fields: {
                    bsonType: "array",
                    description: "Danh sách các cảm biến",
                    items: {
                        bsonType: "object",
                        properties: {
                            temperature_sensor: {
                                bsonType: "object",
                                required: ["value", "unit"],
                                properties: {
                                    value: { bsonType: "double" },
                                    unit: { bsonType: "string" }
                                }
                            },
                            humidity_sensor: {
                                bsonType: "object",
                                required: ["value", "unit"],
                                properties: {
                                    value: { bsonType: "double" },
                                    unit: { bsonType: "string" }
                                }
                            },
                            light_sensor: {
                                bsonType: "object",
                                required: ["value", "unit"],
                                properties: {
                                    value: { bsonType: "double" },
                                    unit: { bsonType: "string" }
                                }
                            }
                        }
                    }
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

db.greenhouses.createIndex({ "page": 1 });
db.queues.createIndex({ "status": 1, "created_at": 1 });

db.users.insertOne({
    username: "admin",
    password: "$2a$10$XgXLGk9VqwPZy.XzG5K5.OiR5XG5Y5XGzG5XG5Y5XG5Y5XG5Y5",
    role: "admin",
    fullname: "Administrator",
    email: "admin@example.com"
});

db.greenhouses.insertMany([{
    name: "Greenhouse 1",
    location: "Khu A",
    page: 1,
    fields: [{
        temperature_sensor: {
            value: 25.5,
            unit: "degree"
        },
        humidity_sensor: {
            value: 65.0,
            unit: "%"
        },
        light_sensor: {
            value: 500.0,
            unit: "lux"
        }
    }]
},
{
    name: "Greenhouse 2",
    location: "Khu B",
    page: 1,
    fields: [{
        temperature_sensor: {
            value: 26.0,
            unit: "degree"
        },
        humidity_sensor: {
            value: 70.0,
            unit: "%"
        },
        light_sensor: {
            value: 600.0,
            unit: "lux"
        }
    }]
}
]);
