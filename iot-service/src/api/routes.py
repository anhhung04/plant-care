import requests
from datetime import datetime, timedelta
from typing import List, Optional, Literal

from fastapi import APIRouter, Depends, HTTPException, Query, status, Body
from fastapi.responses import JSONResponse
from uuid import uuid4

from db.repository import GreenhouseRepository
from db import get_database
from mqtt.client import MQTTClient
from api.models import *

from config.settings import get_settings

router = APIRouter(prefix="/greenhouses", tags=["greenhouses"])
settings = get_settings()


def get_repository() -> GreenhouseRepository:
    db = get_database()
    return GreenhouseRepository(db)


def get_mqtt_client():
    from config.settings import get_settings
    from main import mqtt_client
    settings = get_settings()

    if not mqtt_client:
        mqtt_client = MQTTClient(
            client_id=settings.MQTT_CLIENT_ID,
            host=settings.MQTT_HOST,
            port=settings.MQTT_PORT,
            username=settings.MQTT_USERNAME,
            password=settings.MQTT_PASSWORD,
            use_tls=settings.MQTT_USE_TLS,
        )
        mqtt_client.connect()
    return mqtt_client


@router.post("", response_model=GreenhouseResponse, status_code=status.HTTP_201_CREATED)
async def create_greenhouse(
    request: CreateGreenhouseRequest,
    repo: GreenhouseRepository = Depends(get_repository),
):
    """Create a new greenhouse."""
    try:
        greenhouse = Greenhouse(
            greenhouse_id=f"gh_{str(uuid4()).replace('-','')}",  # Generate unique ID
            name=request.name,
            location=request.location,
            owner=request.owner,
            metadata=request.metadata,
        )

        greenhouse_object_id = repo.create_greenhouse(greenhouse)
        created_greenhouse = repo.get_greenhouse(greenhouse_object_id)

        if not created_greenhouse:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create greenhouse",
            )

        return created_greenhouse

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )


@router.get("", response_model=List[GreenhouseResponse])
async def list_greenhouses(
    owner: Optional[str] = None,
    location: Optional[str] = None,
    offset: int = Query(default=0, ge=0),
    limit: int = Query(default=10, ge=1, le=100),
    repo: GreenhouseRepository = Depends(get_repository),
):
    """List all greenhouses with optional filtering."""
    try:
        greenhouses = repo.get_all_greenhouses(
            owner=owner, location=location, offset=offset, limit=limit
        )
        return greenhouses
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )


@router.get("/{greenhouse_id}", response_model=GreenhouseResponse)
async def get_greenhouse(
    greenhouse_id: str, repo: GreenhouseRepository = Depends(get_repository)
):
    """Get detailed information about a specific greenhouse."""
    greenhouse = repo.get_greenhouse(greenhouse_id)
    if not greenhouse:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Greenhouse {greenhouse_id} not found",
        )
    return greenhouse


@router.delete("/{greenhouse_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_greenhouse(
    greenhouse_id: str, repo: GreenhouseRepository = Depends(get_repository)
):
    """Delete a greenhouse and all its fields."""
    success = repo.delete_greenhouse(greenhouse_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Greenhouse {greenhouse_id} not found",
        )
    return JSONResponse(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/{greenhouse_id}/fields", response_model=FieldResponse)
async def create_field(
    greenhouse_id: str,
    request: CreateFieldRequest,
    repo: GreenhouseRepository = Depends(get_repository),
):
    """Add a new field to a greenhouse."""
    try:
        field = GreenhouseField(metadata=request.metadata, temperature_sensor=[], humidity_sensor=[], soil_moisture_sensor=[], light_sensor=[], fan_status=[], led_status=[], pump_status=[])
        field_index = repo.add_field(greenhouse_id, field)

        if field_index is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Greenhouse {greenhouse_id} not found",
            )

        return FieldResponse(
            field_index=field_index, sensors={}, metadata=request.metadata
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )


@router.get("/{greenhouse_id}/fields", response_model=List[FieldResponse])
async def list_fields(
    greenhouse_id: str, repo: GreenhouseRepository = Depends(get_repository)
):
    """List all fields in a greenhouse."""
    greenhouse = repo.get_greenhouse(greenhouse_id)
    if not greenhouse:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Greenhouse {greenhouse_id} not found",
        )

    return [
        FieldResponse(
            field_index=idx,
            sensors={
                "temperature_sensor": field.temperature_sensor,
                "humidity_sensor": field.humidity_sensor,
                "soil_moisture_sensor": field.soil_moisture_sensor,
                "light_sensor": field.light_sensor,
                "fan_status": field.fan_status,
                "led_status": field.led_status,
                "pump_status": field.pump_status,
            },
            metadata=field.metadata,
        )
        for idx, field in enumerate(greenhouse.fields) if greenhouse.fields
    ]


@router.get("/{greenhouse_id}/fields/{field_index}", response_model=FieldResponse)
async def get_field(
    greenhouse_id: str,
    field_index: int,
    repo: GreenhouseRepository = Depends(get_repository),
):
    """Get detailed information about a specific field."""
    greenhouse = repo.get_greenhouse(greenhouse_id)
    if not greenhouse:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Greenhouse {greenhouse_id} not found",
        )

    if field_index >= len(greenhouse.fields):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Field index {field_index} not found",
        )

    field = greenhouse.fields[field_index]
    return FieldResponse(
        field_index=field_index,
        sensors={
            "temperature_sensor": field.temperature_sensor,
            "humidity_sensor": field.humidity_sensor,
            "soil_moisture_sensor": field.soil_moisture_sensor,
            "light_sensor": field.light_sensor,
            "fan_status": field.fan_status,
            "led_status": field.led_status,
            "pump_status": field.pump_status,
        },
        metadata=field.metadata,
    )


@router.delete(
    "/{greenhouse_id}/fields/{field_index}", status_code=status.HTTP_204_NO_CONTENT
)
async def delete_field(
    greenhouse_id: str,
    field_index: int,
    repo: GreenhouseRepository = Depends(get_repository),
):
    """Delete a field from a greenhouse."""
    success = repo.delete_field(greenhouse_id, field_index)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Field {field_index} not found in greenhouse {greenhouse_id}",
        )
    return JSONResponse(status_code=status.HTTP_204_NO_CONTENT)

@router.patch(
    "/{greenhouse_id}/fields/{field_index}", response_model=FieldResponse
)
async def update_field(
    greenhouse_id: str,
    field_index: int,
    update_field_metadata: UpdateFieldMetadataRequest,
    repo: GreenhouseRepository = Depends(get_repository),
):
    """Update metadata of a field in a greenhouse."""
    try:
        greenhouse = repo.get_greenhouse(greenhouse_id)
        if not greenhouse:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Greenhouse {greenhouse_id} not found",
            )

        if field_index >= len(greenhouse.fields):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Field index {field_index} not found",
            )

        field = greenhouse.fields[field_index]
        if update_field_metadata.config_led:
            field.metadata["config_led"] = update_field_metadata.config_led
        if update_field_metadata.config_fan:
            field.metadata["config_fan"] = update_field_metadata.config_fan
        if update_field_metadata.config_pump:
            field.metadata["config_pump"] = update_field_metadata.config_pump
        field.metadata.update(update_field_metadata.additional)
        updated_field = repo.update_field(greenhouse_id, field_index, field)
        if not updated_field:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update field",
            )
        return FieldResponse(
            field_index=field_index,
            metadata=field.metadata,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )

@router.get(
    "/{greenhouse_id}/fields/{field_index}/history", response_model=List[SensorData]
)
async def get_field_history(
    greenhouse_id: str,
    field_index: int,
    sensor_type: str = Query(..., description="Type of sensor to get history for"),
    start_time: datetime = Query(default=lambda: datetime.utcnow() - timedelta(days=1)),
    end_time: datetime = Query(default=lambda: datetime.utcnow()),
    repo: GreenhouseRepository = Depends(get_repository),
):
    """Get historical sensor data for a specific field."""
    try:
        history = repo.get_sensor_history(
            greenhouse_id=greenhouse_id,
            field_index=field_index,
            sensor_type=sensor_type,
            start_time=start_time,
            end_time=end_time,
        )
        return history
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )


@router.post(
    "/{greenhouse_id}/fields/{field_index}/control", status_code=status.HTTP_200_OK
)
async def control_field_device(
    greenhouse_id: str,
    field_index: int,
    device: Literal["fan", "led", "pump"] = Query(..., description="Device to control"),
    value: int = Query(..., description="Value to set for the device"),
    repo: GreenhouseRepository = Depends(get_repository),
    mqtt_client: MQTTClient = Depends(get_mqtt_client),
):
    """Control field devices (fan, LED, pump) via MQTT."""
    try:
        greenhouse = repo.get_greenhouse(greenhouse_id)
        if not greenhouse:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Greenhouse {greenhouse_id} not found",
            )

        if field_index >= len(greenhouse.fields):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Field index {field_index} not found",
            )
        topic = f"{settings.MQTT_USERNAME}/feeds/{greenhouse_id.replace('_', '-')}.{field_index}-{device}"

        success = mqtt_client.publish(topic, value)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to send command to device",
            )

        return {"status": "success", "message": f"{device}'s value has been set to {value}"}

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )
