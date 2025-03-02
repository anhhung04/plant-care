import logging
from datetime import datetime
from typing import Any, Dict, List, Optional, Union

from pymongo import MongoClient
from pymongo.database import Database
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
from pydantic import BaseModel

from .models import Device, SensorReading, DeviceCommand

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


class DeviceRepository:
    """Repository for device operations."""

    def __init__(self, database: Database):
        self.db = database
        self.collection = database.devices

    def create(self, device: Device) -> str:
        device_dict = device.model_dump()
        result = self.collection.insert_one(device_dict)
        return str(result.inserted_id)

    def get_by_id(self, device_id: str) -> Optional[Device]:
        device_dict = self.collection.find_one({"device_id": device_id})
        if device_dict:
            return Device(**device_dict)
        return None

    def update(self, device_id: str, update_data: Dict[str, Any]) -> bool:
        update_data["updated_at"] = datetime.utcnow()

        result = self.collection.update_one(
            {"device_id": device_id}, {"$set": update_data}
        )
        return result.modified_count > 0

    def delete(self, device_id: str) -> bool:
        result = self.collection.delete_one({"device_id": device_id})
        return result.deleted_count > 0

    def list_all(self, skip: int = 0, limit: int = 100) -> List[Device]:
        cursor = self.collection.find().skip(skip).limit(limit)
        devices = [Device(**device_dict) for device_dict in cursor]
        return devices

    def list_by_type(self, device_type: str) -> List[Device]:
        cursor = self.collection.find({"device_type": device_type})
        devices = [Device(**device_dict) for device_dict in cursor]
        return devices


class SensorReadingRepository:
    def __init__(self, database: Database):
        self.db = database
        self.collection = database.sensor_readings

    def create(self, reading: SensorReading) -> str:
        reading_dict = reading.model_dump()
        result = self.collection.insert_one(reading_dict)
        return str(result.inserted_id)

    def get_by_device(
        self,
        device_id: str,
        start_time: Optional[datetime] = None,
        end_time: Optional[datetime] = None,
        limit: int = 100,
    ) -> List[SensorReading]:
        query = {"device_id": device_id}

        # Add time range filter if provided
        if start_time or end_time:
            query["timestamp"] = {}
            if start_time:
                query["timestamp"]["$gte"] = start_time
            if end_time:
                query["timestamp"]["$lte"] = end_time

        cursor = self.collection.find(query).sort("timestamp", -1).limit(limit)
        readings = [SensorReading(**reading_dict) for reading_dict in cursor]
        return readings

    def get_latest_by_device(self, device_id: str) -> Optional[SensorReading]:
        reading_dict = self.collection.find_one(
            {"device_id": device_id}, sort=[("timestamp", -1)]
        )
        if reading_dict:
            return SensorReading(**reading_dict)
        return None

    def get_readings_by_sensor_type(
        self,
        sensor_type: str,
        start_time: Optional[datetime] = None,
        end_time: Optional[datetime] = None,
        limit: int = 100,
    ) -> List[SensorReading]:
        query = {"sensor_type": sensor_type}

        if start_time or end_time:
            query["timestamp"] = {}
            if start_time:
                query["timestamp"]["$gte"] = start_time
            if end_time:
                query["timestamp"]["$lte"] = end_time

        cursor = self.collection.find(query).sort("timestamp", -1).limit(limit)
        readings = [SensorReading(**reading_dict) for reading_dict in cursor]
        return readings

    def batch_insert(self, readings: List[SensorReading]) -> int:
        if not readings:
            return 0

        readings_dict = [reading.model_dump() for reading in readings]
        result = self.collection.insert_many(readings_dict)
        return len(result.inserted_ids)


class DeviceCommandRepository:
    def __init__(self, database: Database):
        self.db = database
        self.collection = database.device_commands

    def create(self, command: DeviceCommand) -> str:
        command_dict = command.model_dump()
        result = self.collection.insert_one(command_dict)
        return str(result.inserted_id)

    def update_status(
        self, command_id: str, status: str, result: Optional[Dict[str, Any]] = None
    ) -> bool:
        update_data = {"status": status}
        if result is not None:
            update_data["result"] = result

        result = self.collection.update_one({"_id": command_id}, {"$set": update_data})
        return result.modified_count > 0

    def get_pending_commands(self, device_id: str) -> List[DeviceCommand]:
        cursor = self.collection.find(
            {"device_id": device_id, "status": "pending"}
        ).sort("timestamp", 1)

        commands = [DeviceCommand(**command_dict) for command_dict in cursor]
        return commands

    def get_command_history(
        self, device_id: str, limit: int = 50
    ) -> List[DeviceCommand]:
        cursor = (
            self.collection.find({"device_id": device_id})
            .sort("timestamp", -1)
            .limit(limit)
        )

        commands = [DeviceCommand(**command_dict) for command_dict in cursor]
        return commands
