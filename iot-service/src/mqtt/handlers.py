import json
import logging
from abc import ABC, abstractmethod
from datetime import datetime
from typing import Any, Dict, Optional, Tuple

from db.repository import GreenhouseRepository

logger = logging.getLogger(__name__)


class BaseHandler(ABC):
    @abstractmethod
    def handle_message(self, topic: str, payload: bytes):
        pass


class SensorReadingHandler(BaseHandler):
    SENSOR_TYPE_MAPPING = {
        'air': 'humidity_sensor',
        'temp': 'temperature_sensor',
        'soil': 'soil_moisture_sensor',
        'light': 'light_sensor',
        'fan': 'fan_status',
        'led': 'led_status',
        'pump': 'pump_status'
    }

    def __init__(self, greenhouse_repository: GreenhouseRepository):
        self.greenhouse_repository = greenhouse_repository

    def _parse_topic(self, topic: str) -> Tuple[str, str, int, str]:
        """
        Parse MQTT topic in format: username/groups/greenhouse_id/field_index/sensor
        Returns: (username, greenhouse_id, field_index, sensor_type)
        """
        try:
            parts = topic.split("/")

            username = parts[0]
            greenhouse_id = parts[2]
            greenhouse_id = greenhouse_id.replace("-","_")
            field_index, sensor_type = parts[3].split("-")
            field_index = int(field_index)

            return username, greenhouse_id, field_index, sensor_type

        except (IndexError, ValueError) as e:
            logger.error(f"Error parsing topic {topic}: {e}")
            raise

    def handle_message(self, topic: str, payload: bytes):
        try:
            username, greenhouse_id, field_index, sensor_type = self._parse_topic(topic)

            payload_str = payload.decode("utf-8")
            try:
                data = json.loads(payload_str)
                value = float(data.get("value", payload_str))
                unit = data.get("unit", self._get_default_unit(sensor_type))
                timestamp = datetime.fromisoformat(
                    data.get("timestamp", datetime.utcnow().isoformat())
                )
            except json.JSONDecodeError:
                value = float(payload_str) if payload_str.replace('.','',1).isdigit() else payload_str
                unit = self._get_default_unit(sensor_type)
                timestamp = datetime.utcnow()

            mapped_sensor_type = self.SENSOR_TYPE_MAPPING.get(sensor_type)
            if not mapped_sensor_type:
                logger.error(f"Unknown sensor type: {sensor_type}")
                return

            success = self.greenhouse_repository.update_sensor_reading(
                greenhouse_id=greenhouse_id,
                field_index=field_index,
                sensor_type=mapped_sensor_type,
                value=value,
                unit=unit,
                timestamp=timestamp,
                username=username
            )

            if success:
                logger.info(
                    f"Updated {sensor_type} reading for greenhouse {greenhouse_id} "
                    f"field {field_index}: {value} {unit}"
                )
            else:
                logger.error(f"Failed to update reading for greenhouse {greenhouse_id}")

        except Exception as e:
            logger.error(f"Error handling sensor reading: {e}", exc_info=True)

    def _get_default_unit(self, sensor_type: str) -> str:
        unit_mapping = {
            'temp': '°C',
            'air': '%',
            'soil': '%',
            'light': 'lux',
            'fan': 'state',
            'led': 'state',
            'pump': 'state'
        }
        return unit_mapping.get(sensor_type, '')