from flask import Flask, requests

app = Flask(__name__)
app.secret_key = "your_secret_key"

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
