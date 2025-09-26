import React, { useState } from "react";
import { useLiveLocation } from "../hooks/useLiveLocation";
import { useWeatherData } from "../hooks/useWeatherData";
import LocationDisplay from "./LocationDisplay";
import WeatherDisplay from "./WeatherDisplay";
import FireRiskAssessment from "./FireRiskAssessment";
import HomeLocationInput from "./HomeLocationInput";

interface ManualLocation { lat: number; lon: number; label?: string }

const FireRiskDashboard: React.FC = () => {
	const live = useLiveLocation();
	const [manual, setManual] = useState<ManualLocation | null>(null);
	const active = manual || live ? { lat: manual?.lat ?? live?.lat ?? null, lon: manual?.lon ?? live?.lon ?? null } : { lat: null, lon: null };
	const weatherState = useWeatherData(active.lat, active.lon);

	return (
		<div className="app-shell">
			<header className="app-header">
				<div className="logo-dot" />
				<h1 className="h1">
					Honolulu Fire Shield
					<small>Live weather · Fire risk insights</small>
				</h1>
			</header>

			<div className="row" style={{ gap: 24, flexWrap: 'wrap', marginBottom: 24 }}>
				<div>
					<h2 style={{ marginTop: 0 }}>Location Controls</h2>
					<p style={{ fontSize: 13, opacity: 0.8, maxWidth: 360 }}>
						Use your browser location automatically or override with an address or coordinates.
					</p>
					<HomeLocationInput onLocationSet={(lat, lon, label) => setManual({ lat, lon, label })} />
					<form
						onSubmit={(e) => {
							e.preventDefault();
							const form = e.currentTarget as HTMLFormElement;
							const lat = parseFloat((form.elements.namedItem('lat') as HTMLInputElement).value);
							const lon = parseFloat((form.elements.namedItem('lon') as HTMLInputElement).value);
							if (!isNaN(lat) && !isNaN(lon)) setManual({ lat, lon, label: `Manual (${lat.toFixed(3)}, ${lon.toFixed(3)})` });
						}}
						style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}
					>
						<input name="lat" placeholder="Lat" style={{ width: 100 }} />
						<input name="lon" placeholder="Lon" style={{ width: 100 }} />
						<button type="submit">Set Coords</button>
						{manual && <button type="button" onClick={() => setManual(null)}>Clear Override</button>}
					</form>
					<div style={{ marginTop: 10, fontSize: 12 }}>
						Active source: {manual ? <strong>Manual</strong> : live ? <strong>Live (browser)</strong> : 'None'}
						{manual?.label && <div style={{ marginTop: 4 }}>Label: {manual.label}</div>}
						{active.lat != null && active.lon != null && (
							<div style={{ marginTop: 4 }}>Coords: {active.lat.toFixed(4)}, {active.lon.toFixed(4)}</div>
						)}
					</div>
				</div>
			</div>

			<div className="grid">
				<section className="card">
					<h3 className="card-title">
						Conditions
						<span className="card-sub">Updated just now</span>
					</h3>
					<WeatherDisplay data={weatherState.data} loading={weatherState.loading} error={weatherState.error} />
				</section>

				<section className="card">
					<h3 className="card-title">Fire Risk</h3>
					<FireRiskAssessment weather={weatherState.data} backendRisk={weatherState.fireRisk || null} />
				</section>
			</div>
		</div>
	);
};

export default FireRiskDashboard;
