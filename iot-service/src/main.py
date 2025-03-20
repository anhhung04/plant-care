"""Main application module for the IoT service."""

import logging
import signal
import sys
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routes import router as api_router
from config.settings import get_settings
from config.logging_config import configure_logging
from db.repository import get_database, close_database_connection
from mqtt.client import MQTTClient
from mqtt.handlers import (
    SensorReadingHandler,
)

configure_logging()
logger = logging.getLogger(__name__)
settings = get_settings()
mqtt_client = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting IoT Service")

    logger.info("Connecting to MongoDB")
    db = get_database(mongo_uri=settings.MONGODB_URI, db_name=settings.MONGODB_DB_NAME)

    logger.info(
        f"Connecting to MQTT broker at {settings.MQTT_HOST}:{settings.MQTT_PORT}"
    )
    global mqtt_client
    mqtt_client = MQTTClient(
        client_id=settings.MQTT_CLIENT_ID,
        host=settings.MQTT_HOST,
        port=settings.MQTT_PORT,
        username=settings.MQTT_USERNAME,
        password=settings.MQTT_PASSWORD,
        use_tls=settings.MQTT_USE_TLS,
        tls_ca_certs=settings.MQTT_TLS_CA_CERTS,
        tls_certfile=settings.MQTT_TLS_CERTFILE,
        tls_keyfile=settings.MQTT_TLS_KEYFILE,
    )

    mqtt_client.connect()
    # dependency  builder (WIP)
    # device_repo = get_device_repository()
    # reading_repo = get_sensor_reading_repository()
    # command_repo = get_command_repository()

    # mqtt_client.register_handler(
    #     "devices/+/readings/#", SensorReadingHandler(reading_repo)
    # )
    # mqtt_client.register_handler(
    #     "devices/+/commands/response", DeviceCommandHandler(command_repo, mqtt_client)
    # )
    # mqtt_client.register_handler("devices/+/status", DeviceStatusHandler(device_repo))

    logger.info("IoT Service started successfully")

    yield

    logger.info("Shutting down IoT Service")

    if mqtt_client:
        mqtt_client.disconnect()

    close_database_connection()

    logger.info("IoT Service shutdown complete")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="IoT Service API",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=settings.CORS_ALLOW_CREDENTIALS,
    allow_methods=settings.CORS_ALLOW_METHODS,
    allow_headers=settings.CORS_ALLOW_HEADERS,
)

app.include_router(api_router, prefix=settings.API_PREFIX)


from db.repository import (
    DeviceRepository,
    SensorReadingRepository,
    DeviceCommandRepository,
)


def get_device_repository():
    db = get_database()
    return DeviceRepository(db)


def get_sensor_reading_repository():
    db = get_database()
    return SensorReadingRepository(db)


def get_command_repository():
    db = get_database()
    return DeviceCommandRepository(db)


def signal_handler(sig, frame):
    logger.info(f"Received signal {sig}, shutting down...")
    sys.exit(0)


signal.signal(signal.SIGINT, signal_handler)
signal.signal(signal.SIGTERM, signal_handler)


if __name__ == "__main__":
    import uvicorn

    logger.info(
        f"Starting IoT Service in {'debug' if settings.DEBUG else 'production'} mode"
    )
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
        log_level=settings.LOG_LEVEL.lower(),
    )
