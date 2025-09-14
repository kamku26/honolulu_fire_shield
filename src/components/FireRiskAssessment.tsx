import React from "react";

type Props = {
	weather: {
		temp: number;
		humidity: number;
		wind: number;
	} | null;
};

function assessFireRisk(weather: Props["weather"]) {
	if (!weather)
		return { level: "Unknown", details: "No weather data available." };

	const { temp, humidity, wind } = weather;
	let score = 0;

	// Simple scoring system
	if (temp > 30) score += 2;
	else if (temp > 25) score += 1;

	if (humidity < 30) score += 2;
	else if (humidity < 50) score += 1;

	if (wind > 10) score += 2;
	else if (wind > 5) score += 1;

	let level = "Low";
	if (score >= 5) level = "High";
	else if (score >= 3) level = "Moderate";

	const details = `Temp: ${temp}°C, Humidity: ${humidity}%, Wind: ${wind} m/s`;

	return { level, details };
}

const FireRiskAssessment: React.FC<Props> = ({ weather }) => {
	const risk = assessFireRisk(weather);

	return (
		<section>
			<h2>Fire Risk Assessment</h2>
			<p>Risk Level: {risk.level}</p>
			<p>Details: {risk.details}</p>
		</section>
	);
};

export default FireRiskAssessment;
