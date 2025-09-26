from functools import lru_cache
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    open_meteo_base: str = "https://api.open-meteo.com/v1/forecast"
    default_lat: float = 21.3069  # Honolulu
    default_lon: float = -157.8583

    model_config = {
        "env_prefix": "HFS_",
        "case_sensitive": False,
    }

@lru_cache()
def get_settings() -> Settings:
    return Settings()
