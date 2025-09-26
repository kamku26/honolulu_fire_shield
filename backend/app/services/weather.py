from typing import Tuple, Optional
from datetime import datetime
import requests
from . import fire_risk

from ..config import get_settings


def _extract_humidity(data: dict) -> Optional[float]:
    """Robustly derive the humidity value that corresponds to current weather time.

    Previous implementation only matched if the current weather time string
    was exactly present in hourly["time"]. If Open-Meteo applied a timezone
    shift (e.g. auto timezone vs. UTC) or the list skipped the exact stamp,
    humidity incorrectly defaulted to 0%. Here we attempt:
      1. Direct string match.
      2. Nearest-hour match by minimal absolute datetime delta.
      3. Fallback to last humidity value if available.
      4. As final fallback return None so caller can substitute a neutral value.
    """
    try:
        cw = data.get("current_weather", {})
        hourly = data.get("hourly", {})
        cw_time = cw.get("time")
        times = hourly.get("time", []) or []
        hum_values = hourly.get("relativehumidity_2m", []) or []
        if not cw_time or not times or not hum_values:
            return None

        # 1. Direct match
        if cw_time in times:
            idx = times.index(cw_time)
            return float(hum_values[idx])

        # 2. Nearest-hour match
        try:
            cw_dt = datetime.fromisoformat(cw_time)
            best_idx = None
            best_diff = None
            for i, t in enumerate(times):
                try:
                    dt = datetime.fromisoformat(t)
                except Exception:
                    continue
                diff = abs((dt - cw_dt).total_seconds())
                if best_diff is None or diff < best_diff:
                    best_diff = diff
                    best_idx = i
            if best_idx is not None:
                return float(hum_values[best_idx])
        except Exception:
            pass

        # 3. Fallback: last available humidity
        if hum_values:
            return float(hum_values[-1])
    except Exception:
        return None
    return None


def fetch_weather(lat: float, lon: float) -> Tuple[float, float, float]:
    """Return (temp_c, humidity_pct, wind_m_s)."""
    settings = get_settings()
    url = (
        f"{settings.open_meteo_base}?latitude={lat}&longitude={lon}"
        f"&current_weather=true&hourly=relativehumidity_2m"
    )
    resp = requests.get(url, timeout=10)
    resp.raise_for_status()
    data = resp.json()
    cw = data.get("current_weather", {})
    temp = cw.get("temperature")
    wind = cw.get("windspeed")

    humidity = _extract_humidity(data)
    if humidity is None:
        # Neutral fallback so risk calculation not overly pessimistic or optimistic
        humidity = 50.0

    # Clamp just in case
    humidity = max(0.0, min(100.0, float(humidity)))

    if temp is None or wind is None:
        raise ValueError("Incomplete weather data from provider")

    return float(temp), float(humidity), float(wind)


def fetch_weather_with_risk(lat: float, lon: float):
    temp, humidity, wind = fetch_weather(lat, lon)
    risk = fire_risk.compute_fire_risk(temp, humidity, wind)
    return {
        "weather": {"temp": temp, "humidity": humidity, "wind": wind},
        "fireRisk": risk.__dict__,
    }
