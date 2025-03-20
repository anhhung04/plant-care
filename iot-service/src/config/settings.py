"""Settings configuration for the IoT service."""

import os
from functools import lru_cache
from typing import List, Optional, Union

from pydantic import Field, validator
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    """Application settings."""

    APP_NAME: str = "IoT Service"
    APP_VERSION: str = "1.0.0"
    API_PREFIX: str = "/api/v1"
    DEBUG: bool = False

    CORS_ORIGINS: List[str] = ["*"]
    CORS_ALLOW_CREDENTIALS: bool = True
    CORS_ALLOW_METHODS: List[str] = ["*"]
    CORS_ALLOW_HEADERS: List[str] = ["*"]

    MONGODB_URI: str = Field("mongodb://iot-db:27017", env="MONGODB_URI")
    MONGODB_DB_NAME: str = Field("plant_care", env="MONGODB_DB_NAME")

    MQTT_HOST: str = Field("mqtt-server", env="MQTT_HOST")
    MQTT_PORT: int = Field(1884, env="MQTT_PORT")
    MQTT_CLIENT_ID: str = Field("iot-service", env="MQTT_CLIENT_ID")
    MQTT_USERNAME: Optional[str] = Field(None, env="MQTT_USERNAME")
    MQTT_PASSWORD: Optional[str] = Field(None, env="MQTT_PASSWORD")
    MQTT_USE_TLS: bool = Field(False, env="MQTT_USE_TLS")
    MQTT_TLS_CA_CERTS: Optional[str] = Field(None, env="MQTT_TLS_CA_CERTS")
    MQTT_TLS_CERTFILE: Optional[str] = Field(None, env="MQTT_TLS_CERTFILE")
    MQTT_TLS_KEYFILE: Optional[str] = Field(None, env="MQTT_TLS_KEYFILE")

    JWT_SECRET_KEY: str = Field("supersecret", env="JWT_SECRET_KEY")
    JWT_ALGORITHM: str = Field("HS256", env="JWT_ALGORITHM")
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(
        30, env="JWT_ACCESS_TOKEN_EXPIRE_MINUTES"
    )

    LOG_LEVEL: str = Field("INFO", env="LOG_LEVEL")
    LOG_FORMAT: str = Field(
        "%(asctime)s - %(name)s - %(levelname)s - %(message)s", env="LOG_FORMAT"
    )

    @validator("CORS_ORIGINS", pre=True)
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    return Settings()
