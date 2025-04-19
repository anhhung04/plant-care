from datetime import datetime
from typing import Any, Dict, List, Optional, Literal
from pydantic import BaseModel, Field


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


class SensorData(BaseModel):
    value: float = Field(..., description="Current sensor reading value")
    unit: str = Field(..., description="Unit of measurement")
    timestamp: datetime = Field(
        default_factory=datetime.utcnow, description="Timestamp of the reading"
    )

    class Config:
        json_encoders = {datetime: lambda v: v.isoformat()}


class GreenhouseField(BaseModel):
    temperature_sensor: List[SensorData] = Field(
        default=[], description="Temperature sensor data"
    )
    humidity_sensor: List[SensorData] = Field(
        default=[], description="Humidity sensor data"
    )
    soil_moisture_sensor: List[SensorData] = Field(
        default=[], description="Soil moisture sensor data"
    )
    light_sensor: List[SensorData] = Field(
        default=[], description="Light sensor data"
    )
    fan_status: List[SensorData] = Field(
        default=[], description="Fan operational status"
    )
    led_status: List[SensorData] = Field(default=[], description="LED light status")
    pump_status: List[SensorData] = Field(default=[], description="Water pump status")
    metadata: Dict[str, Any] = Field(
        default_factory=dict, description="Additional field metadata"
    )
 # in all modes, these fields are required:
    #     id, name, mode, status, intensity
    #
    # in manual mode, there is an additional field: 
    #     turn_off_after (required) is null or x minutes
    #
    # in scheduled mode, there are additional fields:
    #     turn_on_at (required) is the time to turn on the device, format: "HH:MM"
    #     turn_off_after (required) x minutes (null is not allowed)
    #     repeat (required) is "today", "everyday" or "custom"
    #     dates (required if repeat is "custom") is an array of dates, format: "YYYY-MM-DD"
    #
    # in automatic mode, there are no additional fields
class SensorConfig(BaseModel):
    mode: Literal["manual", "scheduled", "automatic"] = Field(
        default="manual", description="Mode of operation for the sensor"
    )
    turn_off_after: Optional[int] = Field(
        default=None,
        description="Time in minutes to turn off the device after activation (manual mode only)",
    )
    turn_on_at: Optional[str] = Field(
        default=None,
        description="Time to turn on the device (scheduled mode only), format: 'HH:MM'",
    )
    repeat: Optional[Literal["today", "everyday", "custom"]] = Field(
        default=None,
        description="Repeat schedule for the device (scheduled mode only)",
    )
    dates: Optional[List[str]] = Field(
        default=[],
        description="List of dates for custom schedule (scheduled mode only), format: 'YYYY-MM-DD'",
    )
    

class Greenhouse(BaseModel):
    greenhouse_id: str = Field(..., description="Unique identifier for the greenhouse")
    location: str = Field(default="vietnam", description="Physical location of the greenhouse")
    name: str = Field(..., description="Name of the greenhouse")
    owner: str = Field(default="guest", description="Username of the greenhouse owner")
    fields: List[GreenhouseField] = Field(
        default=[],
        description="List of greenhouse fields with their sensor data",
    )
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="Timestamp when the greenhouse was created",
    )
    updated_at: datetime = Field(
        default_factory=datetime.utcnow, description="Timestamp of the last update"
    )
    metadata: Dict[str, Any] = Field(
        default_factory=dict, description="Additional greenhouse metadata"
    )

    class Config:
        json_encoders = {datetime: lambda v: v.isoformat()}


class GreenhouseSettings(BaseModel):
    greenhouse_id: str = Field(
        ..., description="Greenhouse ID these settings belong to"
    )
    temperature_threshold: Dict[str, float] = Field(
        default_factory=lambda: {"min": 20.0, "max": 30.0},
        description="Temperature thresholds in °C",
    )
    humidity_threshold: Dict[str, float] = Field(
        default_factory=lambda: {"min": 60.0, "max": 80.0},
        description="Humidity thresholds in %",
    )
    soil_moisture_threshold: Dict[str, float] = Field(
        default_factory=lambda: {"min": 30.0, "max": 70.0},
        description="Soil moisture thresholds in %",
    )
    light_threshold: Dict[str, float] = Field(
        default_factory=lambda: {"min": 1000.0, "max": 10000.0},
        description="Light level thresholds in lux",
    )
    watering_schedule: Dict[str, Any] = Field(
        default_factory=dict, description="Automated watering schedule settings"
    )
    lighting_schedule: Dict[str, Any] = Field(
        default_factory=dict, description="Automated lighting schedule settings"
    )
    ventilation_settings: Dict[str, Any] = Field(
        default_factory=dict, description="Ventilation control settings"
    )
    created_at: datetime = Field(
        default_factory=datetime.utcnow, description="Settings creation timestamp"
    )
    updated_at: datetime = Field(
        default_factory=datetime.utcnow, description="Settings last update timestamp"
    )

    class Config:
        json_encoders = {datetime: lambda v: v.isoformat()}


class Alert(BaseModel):
    greenhouse_id: str = Field(
        ..., description="ID of the greenhouse that triggered the alert"
    )
    field_index: int = Field(
        ..., description="Index of the field that triggered the alert"
    )
    alert_type: str = Field(
        ..., description="Type of alert (e.g., 'temperature_high', 'humidity_low')"
    )
    severity: str = Field(
        ..., description="Alert severity level (e.g., 'warning', 'critical')"
    )
    message: str = Field(..., description="Alert message description")
    sensor_reading: Optional[SensorReading] = Field(
        default=None, description="Sensor reading that triggered the alert"
    )
    timestamp: datetime = Field(
        default_factory=datetime.utcnow, description="Alert creation timestamp"
    )
    resolved: bool = Field(
        default=False, description="Whether the alert has been resolved"
    )
    resolved_at: Optional[datetime] = Field(
        default=None, description="Timestamp when the alert was resolved"
    )
    metadata: Dict[str, Any] = Field(
        default_factory=dict, description="Additional alert metadata"
    )

    class Config:
        json_encoders = {datetime: lambda v: v.isoformat()}
