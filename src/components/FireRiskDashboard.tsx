import React from "react";
import { useState } from "react";
import { useLiveLocation } from "../hooks/useLiveLocation";
import { useWeatherData } from "../hooks/useWeatherData";
import LocationDisplay from "./LocationDisplay";
import WeatherDisplay from "./WeatherDisplay";
import FireRiskAssessment from "./FireRiskAssessment";

const FireRiskDashboard: React.FC = () => {
	const location = useLiveLocation();
	const weather = useWeatherData(location?.lat ?? null, location?.lon ?? null);
	return (
		<div className="app-shell">
			<header className="app-header">
				<div className="logo-dot" />
				<h1 className="h1">
					Honolulu Fire Shield
					<small>Live weather · Fire risk insights</small>
				</h1>
			</header>

			<div className="row" style={{ marginBottom: 12 }}>
				<LocationDisplay />
			</div>

			<div className="grid">
				<section className="card">
					<h3 className="card-title">
						Conditions
						<span className="card-sub">Updated just now</span>
					</h3>
					<WeatherDisplay weather={weather} />
				</section>

				<section className="card">
					<h3 className="card-title">Fire Risk</h3>
					<FireRiskAssessment weather={weather} />
				</section>
			</div>
		</div>
	);
};

export default FireRiskDashboard;
