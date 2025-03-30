import logging
from datetime import datetime
from typing import Any, Dict, List, Optional, Union

from pymongo import MongoClient
from pymongo.database import Database
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
from pydantic import BaseModel

from .models import *

logger = logging.getLogger(__name__)

_mongo_client: Optional[MongoClient] = None
_database: Optional[Database] = None


def get_database(
    mongo_uri: str = "mongodb://iot-db:27017", db_name: str = "plant_care"
) -> Database:
    global _mongo_client, _database

    if _database is None:
        try:
            logger.info(f"Connecting to MongoDB at {mongo_uri}")
            _mongo_client = MongoClient(mongo_uri)
            _mongo_client.admin.command("ping")
            _database = _mongo_client[db_name]
            logger.info(f"Connected to MongoDB database: {db_name}")

            _database.devices.create_index("device_id", unique=True)
            _database.sensor_readings.create_index("device_id")
            _database.sensor_readings.create_index("timestamp")
            _database.device_commands.create_index(
                [("device_id", 1), ("timestamp", -1)]
            )

        except (ConnectionFailure, ServerSelectionTimeoutError) as e:
            logger.error(f"Failed to connect to MongoDB: {e}")
            raise

    return _database


def close_database_connection() -> None:
    global _mongo_client
    if _mongo_client is not None:
        _mongo_client.close()
        logger.info("MongoDB connection closed")


class GreenhouseRepository:
    def __init__(self, database: Database):
        self.db = database
        self.collection = database.greenhouses

    def update_sensor_reading(
        self,
        greenhouse_id: str,
        field_index: int,
        sensor_type: str,
        value: float,
        unit: str,
        timestamp: datetime,
        username: str,
    ) -> bool:
        try:
            sensor_data = SensorData(
                value=value, unit=unit, timestamp=timestamp
            ).model_dump()

            result = self.collection.update_one(
                {
                    "greenhouse_id": greenhouse_id,
                    f"fields.{field_index}": {"$exists": True},
                },
                {
                    "$push": {
                        f"fields.{field_index}.{sensor_type}": sensor_data,
                        "updated_at": datetime.utcnow(),
                        "$position": 0,
                    }
                },
            )

            if result.matched_count == 0:
                greenhouse = self.get_greenhouse(greenhouse_id)

                if greenhouse:
                    while len(greenhouse.fields) <= field_index:
                        greenhouse.fields.append(GreenhouseField())

                    result = self.collection.update_one(
                        {"greenhouse_id": greenhouse_id},
                        {
                            "$set": {
                                f"fields.{field_index}": GreenhouseField(
                                    **{
                                        sensor_type: [
                                            SensorData(
                                                value=value,
                                                unit=unit,
                                                timestamp=timestamp,
                                            )
                                        ]
                                    }
                                ).model_dump(),
                                "updated_at": datetime.utcnow(),
                            }
                        },
                    )
                else:
                    fields = [GreenhouseField() for _ in range(field_index + 1)]
                    fields[field_index] = GreenhouseField(
                        **{
                            sensor_type: [
                                SensorData(value=value, unit=unit, timestamp=timestamp)
                            ]
                        }
                    )

                    greenhouse = Greenhouse(
                        greenhouse_id=greenhouse_id,
                        location="Unknown",
                        name=f"Greenhouse {greenhouse_id}",
                        owner=username,
                        fields=fields,
                    )
                    self.create_greenhouse(greenhouse)

            return True

        except Exception as e:
            logger.error(f"Error updating sensor reading: {e}")
            return False

    def get_greenhouse(self, greenhouse_id: str) -> Optional[Greenhouse]:
        greenhouse_dict = self.collection.find_one({"greenhouse_id": greenhouse_id})
        if greenhouse_dict:
            return Greenhouse(**greenhouse_dict)
        return None

    def create_greenhouse(self, greenhouse: Greenhouse) -> str:
        greenhouse_dict = greenhouse.model_dump()
        result = self.collection.insert_one(greenhouse_dict)
        return str(result.inserted_id)

    def get_all_greenhouses(self) -> List[Greenhouse]:
        cursor = self.collection.find()
        return [Greenhouse(**gh_dict) for gh_dict in cursor]
