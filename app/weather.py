from flask import Flask, render_template, request, session, redirect
import requests
from datetime import datetime

def zip_to_coords(zip_code):
    try:
        response = requests.get(f"http://api.zippopotam.us/us/{zip_code}", timeout=5)
        if response.status_code == 200:
            data = response.json()
            lat = float(data["places"][0]["latitude"])
            lon = float(data["places"][0]["longitude"])
            return lat, lon
    except Exception as e:
        print(f"ZIP lookup failed: {e}")
    return 20.5, -155.5  # Fallback: default to Hawaii

def get_weather(lat, lon):
    url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&hourly=temperature_2m,precipitation_probability,windspeed_10m,winddirection_10m,relative_humidity_2m"

    try:
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            data = response.json()
            now = datetime.utcnow().replace(minute=0, second=0, microsecond=0).isoformat() + "Z"
            times = data["hourly"]["time"]
            index = times.index(now) if now in times else 0

            return {
                "temperature": round(data["hourly"]["temperature_2m"][index]),
                "wind_speed": round(data["hourly"]["windspeed_10m"][index]),
                "precipitation": data["hourly"]["precipitation_probability"][index],
                "wind_direction": deg_to_compass(data["hourly"]["winddirection_10m"][index]),
                "humidity": data["hourly"]["relative_humidity_2m"][index]
            }
    except Exception as e:
        print(f"Error fetching weather: {e}")

    return {"error": "Weather unavailable"}


def deg_to_compass(degree):
    dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
    ix = round(degree / 45) % 8
    return dirs[ix]
