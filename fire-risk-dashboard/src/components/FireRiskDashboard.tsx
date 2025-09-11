import React from "react";
import LocationDisplay from "./LocationDisplay";
import WeatherDisplay from "./WeatherDisplay";
import FireRiskAssessment from "./FireRiskAssessment";

const FireRiskDashboard: React.FC = () => {
	return (
		<div>
			<h1>Fire Risk Dashboard</h1>
			<LocationDisplay />
			<WeatherDisplay />
			<FireRiskAssessment />
		</div>
	);
};

export default FireRiskDashboard;
