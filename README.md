# Honolulu Fire Shield

A full-stack (React + FastAPI) prototype that provides live location-based weather data and a derived fire risk assessment for Honolulu (or any geolocated point). The frontend fetches weather + risk from a backend API (with graceful fallback directly to Open‑Meteo if the backend is offline).

## Features
- Live geolocation (HTML5 Geolocation API)
- Weather fetch (Open‑Meteo) with humidity enrichment
- Fire risk scoring (temperature, humidity, wind factors)
- Gauge visualization of risk levels (Low → Extreme)
- FastAPI backend consolidating weather + risk logic
- Fallback client-side fetch if backend unavailable
- Extensible service + risk abstraction for future indices (e.g. Fosberg)

## Tech Stack
| Layer | Tech |
|-------|------|
| Frontend | React 18, TypeScript, CRA (react-scripts) |
| Backend | FastAPI, Uvicorn |
| Data Source | Open‑Meteo (no API key) |
| Tests (backend) | Pytest |

## Project Structure (simplified)
```
/ (repo root)
├─ package.json
├─ tsconfig.json
├─ public/
├─ src/
│  ├─ index.tsx
│  ├─ App.tsx
│  ├─ components/
│  │  ├─ FireRiskDashboard.tsx
│  │  ├─ FireRiskAssessment.tsx
│  │  ├─ WeatherDisplay.tsx
│  │  ├─ LocationDisplay.tsx
│  │  └─ HomeLocationInput.tsx (not yet wired in UI)
│  ├─ hooks/
│  │  ├─ useLiveLocation.ts
│  │  └─ useWeatherData.ts (calls backend then falls back)
│  └─ types/
│     ├─ FireRiskResult.ts
│     └─ index.ts
└─ backend/
   ├─ requirements.txt
   └─ app/
      ├─ main.py
      ├─ config.py
      ├─ services/
      │  ├─ weather.py
      │  └─ fire_risk.py
      └─ models/
         └─ schemas.py
```

## Fire Risk Scoring
Each factor contributes 0–3 points (higher risk adds more):
- Temperature: >30°C +3, >25°C +2, >20°C +1
- Humidity: <20% +3, <35% +2, <50% +1
- Wind: >15 m/s +3, >8 +2, >4 +1

Total raw score 0–9 is scaled ×10 (0–90) for the gauge:
| Raw | Level |
|-----|-------|
| 0–1 | Low |
| 2–3 | Moderate |
| 4 | High |
| 5–6 | Very High |
| 7–9 | Extreme |

## Running the Frontend
```powershell
# From repo root
npm install
npm start
# Opens http://localhost:3000
```
If you see a module resolution error, clear and reinstall:
```powershell
rd /s /q node_modules
rm package-lock.json
npm install
npm start
```

## Backend Setup
The backend lives in `backend/` and uses a Python virtual environment (recommended).

### 1. Create / Activate Virtual Environment (if not already)
```powershell
# From repo root
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

### 2. Install Dependencies
```powershell
pip install -r backend/requirements.txt
```

### 3. Run Backend Server
```powershell
uvicorn backend.app.main:app --reload --port 8000
```
Server will be at: `http://127.0.0.1:8000`

### 4. Test Health Endpoint
```powershell
curl http://127.0.0.1:8000/api/health
```

### 5. Example Weather POST
```powershell
curl -X POST http://127.0.0.1:8000/api/weather -H "Content-Type: application/json" -d '{"lat":21.3069,"lon":-157.8583}'
```

## Frontend ↔ Backend Integration
The hook `useWeatherData` first POSTs to `/api/weather`. In development you can set up a proxy so `/api/*` goes to the backend:

Add (if missing) a line in `package.json`:
```json
"proxy": "http://127.0.0.1:8000"
```
Restart `npm start` after adding the proxy. If the backend is down, the hook falls back to direct Open‑Meteo fetch and sets an error message.

## Running Backend Tests
```powershell
.\.venv\Scripts\Activate.ps1
pytest backend/tests -q
```

## Environment Variables
You can override defaults using prefix `HFS_` (see `config.py`). Example:
```powershell
$env:HFS_DEFAULT_LAT=21.5
$env:HFS_DEFAULT_LON=-157.9
uvicorn backend.app.main:app --reload --port 8000
```

## Roadmap / Next Improvements
- Persist a “home” location (localStorage + backend user profile later)
- Add websocket or polling for periodic updates
- Normalize risk score to full 0–100 scale
- Add more indices (e.g. Fosberg, Keetch–Byram)
- Better error + loading UI skeletons
- Centralize location + weather in React context
- Add frontend unit tests (Jest + React Testing Library)

## License
MIT