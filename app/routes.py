from flask import Flask, Blueprint, render_template, request, session, redirect, datetime, requests
from .weather import get_weather, deg_to_compass
from .weather import zip_to_coords
from .alerts import get_fire_alerts

def configure_routes(app):
    @app.route("/")
    def home():
        return render_template("index.html")
    
    def index():
        lit = 1
        lat = session.get("lat", 20.5)
        lon = session.get("lon", -155.5)
        alerts = get_fire_alerts()
        weather = get_weather(lat, lon)
        return render_template("index.html", alerts=alerts, weather=weather)

    #Route for the homepage dashboard
    @app.route("/get-weather")
    def get_weather_route():
        lat = request.args.get("lat", type=float)
        lon = request.args.get("lon", type=float)
        print(f"Received lat: {lat}, lon: {lon}")
        return get_weather_api()

    @app.route("/set-location", methods=["POST"])
    def set_location():
        zip_code = request.form.get("zip")
        if zip_code:
            lat, lon = zip_to_coords(zip_code)
            session["lat"] = lat
            session["lon"] = lon
        return redirect("/")


    @app.route("/system_defense")
    def system_defense():
        return render_template("system_defense.html")

    @app.route("/system_status")
    def system_status():
        return render_template("system_status.html")


    @app.route("/update-location")
    def update_location():
        lat = request.args.get("lat", type=float)
        lon = request.args.get("lon", type=float)
        if lat and lon:
            session["lat"] = lat
            session["lon"] = lon
        return ("", 204)

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
