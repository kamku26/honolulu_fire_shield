from pydantic import BaseModel
from typing import Optional

class WeatherRequest(BaseModel):
    lat: float
    lon: float

class WeatherResponse(BaseModel):
    temp: float
    humidity: float
    wind: float

class FireRiskResponse(BaseModel):
    score: float
    level: str
    explanation: str
    color: str

class HealthResponse(BaseModel):
    status: str
    version: str = "1.0.0"

class GeocodeResponse(BaseModel):
    lat: float
    lon: float
    display_name: Optional[str] = None
    raw: Optional[dict] = None
