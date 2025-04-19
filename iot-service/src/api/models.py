from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field
from db.models import *


class CreateGreenhouseRequest(BaseModel):
    name: str
    location: str
    owner: str
    metadata: Dict[str, Any] = Field(default_factory=dict)


class CreateFieldRequest(BaseModel):
    metadata: Dict[str, Any] = Field(default_factory=dict)


class GreenhouseResponse(BaseModel):
    greenhouse_id: str
    name: str
    location: str
    owner: str
    fields: List[GreenhouseField]
    created_at: datetime
    updated_at: datetime
    metadata: Dict[str, Any]


class FieldResponse(BaseModel):
    field_index: int
    sensors: Optional[Dict[str, List[SensorData]]] = None
    metadata: Dict[str, Any]

class UpdateFieldMetadataRequest(BaseModel):
    config_led: Optional[SensorConfig] = None
    config_fan: Optional[SensorConfig] = None
    config_pump: Optional[SensorConfig] = None
    additional: Dict[str, Any] = Field(default_factory=dict)