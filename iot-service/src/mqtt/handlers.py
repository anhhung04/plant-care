import json
import logging
import requests
from abc import ABC, abstractmethod
from datetime import datetime
from typing import Any, Dict, Optional, Tuple
from datetime import datetime
from config.settings import get_settings

from db.repository import GreenhouseRepository

logger = logging.getLogger(__name__)

settings = get_settings()

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
        Parse MQTT topic in format: username/feeds/greenhouse_id.field_index-sensor
        Returns: (username, greenhouse_id, field_index, sensor_type)
        """
        try:
            parts = topic.split("/")

            username = parts[0]
            greenhouse_id, tmp = parts[2].replace("-","_").split(".")
            index, sensor_type = tmp.split("_")
            field_index = int(index)

            return username, greenhouse_id, field_index, sensor_type
        except (IndexError, ValueError) as e:
            logger.error(f"Error parsing topic {topic}: {e}")
            return None, None, None, None
        
    def _get_default_unit(self, sensor_type: str) -> str:
        DEFAULT_UNITS = {
            "temp": "C",
            "air": "%",
            "soil": "%",
            "light": "lux",
            "fan": "N/A",
            "led": "N/A",
            "pump": "N/A",
        }
        
        return DEFAULT_UNITS.get(sensor_type.lower(), "")

    def handle_message(self, topic: str, payload: bytes):
        logger.debug(f"Received message on topic {topic}: {payload}")
        try:
            if not topic.endswith("/json") or "gh-" not in topic:
                return
            username, greenhouse_id, field_index, sensor_type = self._parse_topic(topic)
            if not greenhouse_id or "gh_" not in greenhouse_id:
                return

            payload_str = payload.decode("utf-8")
            try:
                feed = json.loads(payload_str)
                value = feed.get("last_value", feed.get("data",{}).get("value", None))
                unit = self._get_default_unit(sensor_type)
                now = feed.get("data", {}).get("created_at", "")
                if now:
                    timestamp = datetime.strptime(feed.get("updated_at", ).replace(' UTC', ''), '%Y-%m-%d %H:%M:%S')
                else:
                    timestamp = datetime.utcnow()

                mapped_sensor_type = self.SENSOR_TYPE_MAPPING.get(sensor_type)
                if not mapped_sensor_type:
                    raise ValueError(f"Unknown sensor type: {sensor_type}")

                success = self.greenhouse_repository.update_sensor_reading(
                    greenhouse_id=greenhouse_id,
                    field_index=field_index,
                    sensor_type=mapped_sensor_type,
                    value=value,
                    unit=unit,
                    timestamp=timestamp,
                    username=username
                )

                if success and requests.get(f"http://backend:8080/mobileBE/greenhouses/update/" + greenhouse_id, headers={"X-Auth-Key": settings.BE_PRESHARED_KEY}).status_code == 200:
                    logger.info(
                        f"Updated {sensor_type} reading for greenhouse {greenhouse_id} "
                        f"field {field_index}: {value} {unit}"
                    )
                else:
                    logger.error(f"Failed to update reading for greenhouse {greenhouse_id}")

            except json.JSONDecodeError:
                value = float(payload_str) if payload_str.replace('.','',1).isdigit() else payload_str
                unit = self._get_default_unit("")  # Default sensor type unknown
                timestamp = datetime.utcnow()
                logger.warning("Non-JSON payload received, using fallback with limited data")

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