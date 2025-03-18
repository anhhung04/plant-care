import json
import logging
from abc import ABC, abstractmethod
from datetime import datetime
from typing import Any, Dict, Optional

from ..db.models import SensorReading, DeviceCommand
from ..db.repository import SensorReadingRepository, DeviceCommandRepository

logger = logging.getLogger(__name__)


class BaseHandler(ABC):
    @abstractmethod
    def handle_message(self, topic: str, payload: bytes):
        pass


class SensorReadingHandler(BaseHandler):
    def __init__(self, reading_repository: SensorReadingRepository):
        self.reading_repository = reading_repository

    def handle_message(self, topic: str, payload: bytes):
        try:
            topic_parts = topic.split("/")
            if len(topic_parts) < 4:
                logger.error(f"Invalid topic format: {topic}")
                return

            device_id = topic_parts[1]
            sensor_type = topic_parts[3]

            payload_str = payload.decode("utf-8")
            data = json.loads(payload_str)

            reading = SensorReading(
                device_id=device_id,
                sensor_type=sensor_type,
                value=float(data.get("value")),
                unit=data.get("unit"),
                timestamp=datetime.fromisoformat(
                    data.get("timestamp", datetime.utcnow().isoformat())
                ),
                metadata=data.get("metadata", {}),
            )

            self.reading_repository.create(reading)
            logger.info(
                f"Saved sensor reading from device {device_id}: {reading.value} {reading.unit}"
            )

        except json.JSONDecodeError:
            logger.error(f"Invalid JSON payload: {payload}")
        except KeyError as e:
            logger.error(f"Missing required field in payload: {e}")
        except Exception as e:
            logger.error(f"Error handling sensor reading: {e}")
