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
		<div>
			<h1>Fire Risk Dashboard</h1>
			<WeatherDisplay weather={weather} />
			<FireRiskAssessment weather={weather} />
		</div>
	);
};

export default FireRiskDashboard;
