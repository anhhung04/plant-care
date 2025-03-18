CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS greenhouses (
    greenhouse_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id       VARCHAR(50),
    name          VARCHAR(255) NOT NULL,
    location      VARCHAR(255),
    status        VARCHAR(50),
    description   TEXT
);

CREATE TABLE IF NOT EXISTS gardens (
    garden_id  UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name       VARCHAR(255),
    land_area  NUMERIC(10, 2)
);

CREATE TABLE IF NOT EXISTS greenhouse_garden (
    greenhouse_id UUID NOT NULL,
    garden_id     UUID NOT NULL,
    PRIMARY KEY (greenhouse_id, garden_id),
    CONSTRAINT fk_gg_greenhouse
        FOREIGN KEY (greenhouse_id)
        REFERENCES greenhouses(greenhouse_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_gg_garden
        FOREIGN KEY (garden_id)
        REFERENCES gardens(garden_id)cl
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS sensors (
    sensor_id     UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    greenhouse_id UUID NOT NULL,
    type          VARCHAR(50) NOT NULL,
    max_threshold DOUBLE PRECISION,
    min_threshold DOUBLE PRECISION,
    last_modify   TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fk_sensor_greenhouse
        FOREIGN KEY (greenhouse_id)
        REFERENCES greenhouses(greenhouse_id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS alerts (
    alert_id   UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    sensor_id  UUID NOT NULL,
    message    TEXT,
    status     VARCHAR(50),
    alert_time TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fk_alert_sensor
        FOREIGN KEY (sensor_id)
        REFERENCES sensors(sensor_id)
        ON DELETE CASCADE
);
