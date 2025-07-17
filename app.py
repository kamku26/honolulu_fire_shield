from flask import Flask, render_template, request, session, redirect
import requests
from datetime import datetime


app = Flask(__name__)
app.secret_key = "your_secret_key"

@app.route("/get-weather")
def get_weather_route():
    lat = request.args.get("lat", type=float)
    lon = request.args.get("lon", type=float)
    print(f"Received lat: {lat}, lon: {lon}")
    return get_weather_api()


@app.route("/")
def index():
    lit = 1
    lat = session.get("lat", 20.5)
    lon = session.get("lon", -155.5)
    alerts = get_fire_alerts()
    weather = get_weather(lat, lon)
    return render_template("index.html", alerts=alerts, weather=weather)


@app.route("/system_defense")
def system_defense():
    return render_template("system_defense.html")

@app.route("/system_status")
def system_status():
    return render_template("system_status.html")

@app.route("/get-weather")
def get_weather_api():
    lat = request.args.get("lat", type=float)
    lon = request.args.get("lon", type=float)
    print(f"Received lat: {lat}, lon: {lon}")

    if lat is None or lon is None:
        return {"error": "Missing coordinates"}, 400

    url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&hourly=temperature_2m,precipitation_probability,windspeed_10m,winddirection_10m,relative_humidity_2m&temperature_unit=fahrenheit&windspeed_unit=mph"

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

    return {"error": "Weather unavailable"}, 500

@app.route("/update-location")
def update_location():
    lat = request.args.get("lat", type=float)
    lon = request.args.get("lon", type=float)
    if lat and lon:
        session["lat"] = lat
        session["lon"] = lon
    return ("", 204)

@app.route("/set-location", methods=["POST"])
def set_location():
    zip_code = request.form.get("zip")
    if zip_code:
        lat, lon = zip_to_coords(zip_code)
        session["lat"] = lat
        session["lon"] = lon
    return redirect("/")

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


def get_fire_alerts():
    url = "https://api.weather.gov/alerts/active?area=HI"
    headers = {"User-Agent": "Honolulu Fire Shield (contact@hfs.com)"}
    alerts = []
    try:
        response = requests.get(url, headers=headers, timeout=10)
        if response.status_code == 200:
            data = response.json()
            for alert in data.get("features", []):
                props = alert.get("properties", {})
                event = props.get("event", "")
                if "Fire" in event or "Fire" in props.get("headline", ""):
                    alerts.append({
                        "event": event,
                        "headline": props.get("headline", ""),
                        "description": props.get("description", ""),
                        "area": props.get("areaDesc", "Unknown Area")
                    })
    except Exception as e:
        print(f"Error fetching alerts: {e}")
    return alerts

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


if __name__ == "__main__":
    app.run(debug=True)
