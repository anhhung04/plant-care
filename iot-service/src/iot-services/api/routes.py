from datetime import datetime, timedelta
from typing import Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status

from ..db.models import Device, DeviceCommand, SensorReading
from ..db.repository import (
    DeviceCommandRepository,
    DeviceRepository,
    SensorReadingRepository,
    get_database,
)
from ..mqtt.client import MQTTClient
from . import models

router = APIRouter()


def get_device_repository():
    db = get_database()
    return DeviceRepository(db)


def get_sensor_reading_repository():
    db = get_database()
    return SensorReadingRepository(db)


def get_command_repository():
    db = get_database()
    return DeviceCommandRepository(db)


def get_mqtt_client():
    from ..config import get_settings

    settings = get_settings()

    client = MQTTClient(
        client_id=settings.mqtt_client_id,
        host=settings.mqtt_host,
        port=settings.mqtt_port,
        username=settings.mqtt_username,
        password=settings.mqtt_password,
        use_tls=settings.mqtt_use_tls,
    )
    return client


@router.post(
    "/devices",
    response_model=models.DeviceResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new device",
    description="Create a new IoT device in the system",
)
def create_device(
    device: models.DeviceCreate, repo: DeviceRepository = Depends(get_device_repository)
):
    """Create a new device."""
    existing_device = repo.get_by_id(device.device_id)
    if existing_device:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Device with ID {device.device_id} already exists",
        )

    new_device = Device(
        device_id=device.device_id,
        name=device.name,
        device_type=device.device_type,
        location=device.location,
        metadata=device.metadata or {},
    )

    repo.create(new_device)
    return new_device


@router.get(
    "/devices",
    response_model=List[models.DeviceResponse],
    summary="List devices",
    description="List all devices with optional pagination",
)
def list_devices(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(
        100, ge=1, le=1000, description="Maximum number of records to return"
    ),
    device_type: Optional[str] = Query(None, description="Filter by device type"),
    repo: DeviceRepository = Depends(get_device_repository),
):
    if device_type:
        return repo.list_by_type(device_type)
    return repo.list_all(skip=skip, limit=limit)


@router.get(
    "/devices/{device_id}",
    response_model=models.DeviceResponse,
    summary="Get device",
    description="Get a device by its ID",
)
def get_device(device_id: str, repo: DeviceRepository = Depends(get_device_repository)):
    device = repo.get_by_id(device_id)
    if not device:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Device with ID {device_id} not found",
        )
    return device


@router.put(
    "/devices/{device_id}",
    response_model=models.DeviceResponse,
    summary="Update device",
    description="Update a device's information",
)
def update_device(
    device_id: str,
    device_update: models.DeviceUpdate,
    repo: DeviceRepository = Depends(get_device_repository),
):
    existing_device = repo.get_by_id(device_id)
    if not existing_device:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Device with ID {device_id} not found",
        )
    update_data = device_update.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="No fields to update"
        )

    success = repo.update(device_id, update_data)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update device",
        )

    return repo.get_by_id(device_id)


@router.delete(
    "/devices/{device_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete device",
    description="Delete a device by its ID",
)
def delete_device(
    device_id: str, repo: DeviceRepository = Depends(get_device_repository)
):
    existing_device = repo.get_by_id(device_id)
    if not existing_device:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Device with ID {device_id} not found",
        )

    success = repo.delete(device_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete device",
        )
