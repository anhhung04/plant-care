from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


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
    sensors: Dict[str, Optional[SensorData]]
    metadata: Dict[str, Any]