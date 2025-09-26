from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .config import get_settings
from .models.schemas import WeatherRequest, WeatherResponse, FireRiskResponse, HealthResponse, GeocodeResponse
from .services.weather import fetch_weather_with_risk
from .services.fire_risk import compute_fire_risk
import requests

app = FastAPI(title="Honolulu Fire Shield API", version="1.0.0")

# CORS (allow local frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health", response_model=HealthResponse)
def health():
    return {"status": "ok"}


@app.post("/api/weather")
def weather(req: WeatherRequest):
    try:
        result = fetch_weather_with_risk(req.lat, req.lon)
        return result
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))


@app.get("/api/fire-risk", response_model=FireRiskResponse)
def fire_risk(lat: float, temp: float, humidity: float, wind: float):
    # alt endpoint if client already has raw weather
    risk = compute_fire_risk(temp, humidity, wind)
    return risk.__dict__


@app.get("/api/geocode", response_model=GeocodeResponse)
def geocode(q: str):
    # Simple Nominatim wrapper (rate-limit friendly use: add UA header)
    url = "https://nominatim.openstreetmap.org/search"
    params = {"format": "json", "limit": 1, "q": q}
    headers = {"User-Agent": "HonoluluFireShield/1.0 (educational)"}
    try:
        r = requests.get(url, params=params, headers=headers, timeout=10)
        r.raise_for_status()
        data = r.json()
        if not data:
            raise HTTPException(status_code=404, detail="Address not found")
        first = data[0]
        return {
            "lat": float(first["lat"]),
            "lon": float(first["lon"]),
            "display_name": first.get("display_name"),
            "raw": first,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))


settings = get_settings()


@app.get("/api/default-location")
def default_location():
    return {"lat": settings.default_lat, "lon": settings.default_lon}
