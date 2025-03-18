from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class DeviceCreate(BaseModel):
    device_id: str = Field(..., description="Unique identifier for the device")
    name: str = Field(..., description="Human-readable name for the device")
    device_type: str = Field(
        ..., description="Type of the device (e.g., 'sensor', 'actuator')"
    )
    location: Optional[str] = Field(None, description="Physical location of the device")
    metadata: Optional[Dict[str, Any]] = Field(
        None, description="Additional device metadata"
    )


class DeviceUpdate(BaseModel):
    name: Optional[str] = Field(None, description="Human-readable name for the device")
    location: Optional[str] = Field(None, description="Physical location of the device")
    is_active: Optional[bool] = Field(None, description="Whether the device is active")
    metadata: Optional[Dict[str, Any]] = Field(
        None, description="Additional device metadata"
    )


class DeviceResponse(BaseModel):
    device_id: str = Field(..., description="Unique identifier for the device")
    name: str = Field(..., description="Human-readable name for the device")
    device_type: str = Field(
        ..., description="Type of the device (e.g., 'sensor', 'actuator')"
    )
    location: Optional[str] = Field(None, description="Physical location of the device")
    is_active: bool = Field(..., description="Whether the device is active")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")
    metadata: Dict[str, Any] = Field(
        default_factory=dict, description="Additional device metadata"
    )


class SensorReadingCreate(BaseModel):
    device_id: str = Field(
        ..., description="ID of the device that produced the reading"
    )
    value: float = Field(..., description="Sensor reading value")
    unit: str = Field(..., description="Unit of measurement")
    sensor_type: str = Field(
        ..., description="Type of sensor (e.g., 'temperature', 'humidity')"
    )
    timestamp: Optional[datetime] = Field(None, description="Reading timestamp")
    metadata: Optional[Dict[str, Any]] = Field(
        None, description="Additional reading metadata"
    )


class SensorReadingResponse(BaseModel):
    device_id: str = Field(
        ..., description="ID of the device that produced the reading"
    )
    value: float = Field(..., description="Sensor reading value")
    unit: str = Field(..., description="Unit of measurement")
    sensor_type: str = Field(
        ..., description="Type of sensor (e.g., 'temperature', 'humidity')"
    )
    timestamp: datetime = Field(..., description="Reading timestamp")
    metadata: Dict[str, Any] = Field(
        default_factory=dict, description="Additional reading metadata"
    )


class CommandCreate(BaseModel):
    device_id: str = Field(..., description="ID of the target device")
    command: str = Field(..., description="Command to execute")
    parameters: Optional[Dict[str, Any]] = Field(None, description="Command parameters")


class CommandResponse(BaseModel):
    id: str = Field(..., description="Command ID")
    device_id: str = Field(..., description="ID of the target device")
    command: str = Field(..., description="Command to execute")
    parameters: Dict[str, Any] = Field(
        default_factory=dict, description="Command parameters"
    )
    timestamp: datetime = Field(..., description="Command timestamp")
    status: str = Field(..., description="Command status")
    result: Optional[Dict[str, Any]] = Field(
        None, description="Command execution result"
    )


class ErrorResponse(BaseModel):
    detail: str = Field(..., description="Error detail")
