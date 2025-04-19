import logging
from datetime import datetime
from typing import Any, Dict, List, Optional, Union

from pymongo import MongoClient
from pymongo.database import Database
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError

from bson.objectid import ObjectId

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
                        f"fields.{field_index}.{sensor_type}": {
                            "$each": [sensor_data],
                            "$position": 0
                        }
                    },
                    "$set": {
                        "updated_at": datetime.utcnow()
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
        try:
            object_id = ObjectId(greenhouse_id)
        except Exception:
            object_id = None
        greenhouse_dict = self.collection.find_one({
            "$or": [
                {"greenhouse_id": greenhouse_id}, {"_id": object_id}
            ]
        }, {
            "fields.temperature_sensor": { "$slice": 10 },
            "fields.humidity_sensor": { "$slice": 10 },
            "fields.soil_moisture_sensor": { "$slice": 10 },
            "fields.light_sensor": { "$slice": 10 },
            "fields.led_status": { "$slice": 10 },
            "fields.fan_status": { "$slice": 10 },
            "fields.pump_status": { "$slice": 10 },
        })
        if greenhouse_dict:
            return Greenhouse(**greenhouse_dict)
        return None

    def create_greenhouse(self, greenhouse: Greenhouse) -> str:
        greenhouse_dict = greenhouse.model_dump()
        result = self.collection.insert_one(greenhouse_dict)
        return str(result.inserted_id)
    
    def delete_greenhouse(self, greenhouse_id: str) -> bool:
        try:
            result = self.collection.delete_one({"greenhouse_id": greenhouse_id})
            return result.deleted_count > 0
        except Exception as e:
            logger.error(f"Error deleting greenhouse: {e}")
            return False
    
    def add_field(self, greenhouse_id: str, field: GreenhouseField) -> bool:
        try:
            result = self.collection.update_one(
                {"greenhouse_id": greenhouse_id},
                {"$push": {"fields": field.model_dump()}, "$set": {"updated_at": datetime.utcnow()}}
            )
            field_index = len(self.collection.find_one({"greenhouse_id": greenhouse_id})["fields"]) - 1
            return field_index
        except Exception as e:
            logger.error(f"Error adding field: {e}")
            return None
    
    def get_sensor_history(self, greenhouse_id: str, field_index: int, sensor_type: str, start_time: datetime, end_time: datetime) -> List[SensorData]:
        try:
            greenhouse = self.get_greenhouse(greenhouse_id)
            if not greenhouse or field_index >= len(greenhouse.fields):
                return []

            field = greenhouse.fields[field_index]
            sensor_data_list = getattr(field, sensor_type, [])
            filtered_data = [
                data for data in sensor_data_list
                if start_time <= data.timestamp <= end_time
            ]
            return filtered_data
        except Exception as e:
            logger.error(f"Error retrieving sensor history: {e}")
            return []
    
    def update_field(self, greenhouse_id: str, field_index: int, field: GreenhouseField) -> bool:
        try:
            result = self.collection.update_one(
                {"greenhouse_id": greenhouse_id},
                {"$set": {f"fields.{field_index}": field.model_dump(), "updated_at": datetime.utcnow()}}
            )
            return result.modified_count > 0
        except Exception as e:
            logger.error(f"Error updating field: {e}")
            return False
    
    def delete_field(self, greenhouse_id: str, field_index: int) -> bool:
        try:
            result = self.collection.update_one(
                {"greenhouse_id": greenhouse_id},
                {"$unset": {f"fields.{field_index}": ""}, "$set": {"updated_at": datetime.utcnow()}}
            )
            return result.modified_count > 0
        except Exception as e:
            logger.error(f"Error deleting field: {e}")
            return False

    def get_all_greenhouses(self, owner, location, offset, limit) -> List[Greenhouse]:
        filter_obj = {}
        if owner:
            filter_obj["owner"] = owner
        if location:
            filter_obj["location"] = location
        cursor = self.collection.find(filter_obj,{
            "fields.temperature_sensor": { "$slice": 10 },
            "fields.humidity_sensor": { "$slice": 10 },
            "fields.soil_moisture_sensor": { "$slice": 10 },
            "fields.light_sensor": { "$slice": 10 },
            "fields.led_status": { "$slice": 10 },
            "fields.fan_status": { "$slice": 10 },
            "fields.pump_status": { "$slice": 10 },
        }).sort("updated_at", -1).skip(offset).limit(limit)
        if cursor is None:
            return []
        return [Greenhouse(**gh_dict) for gh_dict in cursor]
