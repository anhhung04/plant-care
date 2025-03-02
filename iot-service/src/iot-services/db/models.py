from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class DeviceBase(BaseModel):
    device_id: str = Field(..., description="Unique identifier for the device")
    name: str = Field(..., description="Human-readable name for the device")
    device_type: str = Field(
        ..., description="Type of the device (e.g., 'sensor', 'actuator')"
    )
    location: Optional[str] = Field(None, description="Physical location of the device")


class Device(DeviceBase):
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = Field(True, description="Whether the device is active")
    metadata: Dict[str, Any] = Field(
        default_factory=dict, description="Additional device metadata"
    )

    class Config:
        json_encoders = {datetime: lambda v: v.isoformat()}


class SensorReading(BaseModel):
    device_id: str = Field(
        ..., description="ID of the device that produced the reading"
    )
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    value: float = Field(..., description="Sensor reading value")
    unit: str = Field(..., description="Unit of measurement")
    sensor_type: str = Field(
        ..., description="Type of sensor (e.g., 'temperature', 'humidity')"
    )
    metadata: Dict[str, Any] = Field(
        default_factory=dict, description="Additional reading metadata"
    )

    class Config:
        """Pydantic model configuration."""

        json_encoders = {datetime: lambda v: v.isoformat()}


class DeviceCommand(BaseModel):
    device_id: str = Field(..., description="ID of the target device")
    command: str = Field(..., description="Command to execute")
    parameters: Dict[str, Any] = Field(
        default_factory=dict, description="Command parameters"
    )
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    status: str = Field(
        "pending", description="Command status (pending, sent, executed, failed)"
    )
    result: Optional[Dict[str, Any]] = Field(
        None, description="Command execution result"
    )

    class Config:
        json_encoders = {datetime: lambda v: v.isoformat()}
