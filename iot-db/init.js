db = db.getSiblingDB('plant_care');
db.createCollection('sensors_data');

db.createUser({
    user: "admin",
    pwd: "password",
    roles: roles.map(role => ({ role: ["readWrite"], db: "plant_care" }))
});


