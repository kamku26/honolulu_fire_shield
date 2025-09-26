import React, { useMemo } from "react";
import { FireRiskResult } from "../types/FireRiskResult";

interface WeatherData {
	temp: number;
	humidity: number;
	wind: number;
}
interface Props {
	weather: WeatherData | null;
	backendRisk?: {
		score: number;
		level: string;
		explanation: string;
		color: string;
	} | null;
}

// Map score → level
function mapScoreToLevel(score: number): FireRiskResult {
	let level: FireRiskResult["level"] = "Low";
	if (score >= 7) level = "Extreme";
	else if (score >= 5) level = "Very High";
	else if (score >= 4) level = "High";
	else if (score >= 2) level = "Moderate";

	let explanation = "";
	switch (level) {
		case "Low":
			explanation = "Conditions are safe. Minimal fire risk.";
			break;
		case "Moderate":
			explanation = "Be cautious. Some factors may increase fire risk.";
			break;
		case "High":
			explanation = "High chance of fire spread. Avoid open flames.";
			break;
		case "Very High":
			explanation = "Conditions are dangerous. Fires can spread rapidly.";
			break;
		case "Extreme":
			explanation = "Critical fire risk. Any fire could become uncontrollable.";
			break;
	}

	const color =
		level === "Low"
			? "var(--ok)"
			: level === "Moderate"
				? "var(--warn)"
				: level === "High"
					? "var(--high)"
					: level === "Very High"
						? "var(--vhigh)"
						: "var(--extreme)";

	return { score: score * 10, level, explanation, color };
}

// Compute fire risk
function assessFireRisk(weather: WeatherData | null): FireRiskResult | null {
	if (!weather) return null;
	const { temp, humidity, wind } = weather;

	let score = 0;
	if (temp > 30) score += 3;
	else if (temp > 25) score += 2;
	else if (temp > 20) score += 1;

	if (humidity < 20) score += 3;
	else if (humidity < 35) score += 2;
	else if (humidity < 50) score += 1;

	if (wind > 15) score += 3;
	else if (wind > 8) score += 2;
	else if (wind > 4) score += 1;

	return mapScoreToLevel(score);
}

// Angle helper
const angleFromScore = (score: number) =>
	`${Math.min(100, Math.max(0, score)) * 3.6 - 90}deg`;

const FireRiskAssessment: React.FC<Props> = ({ weather, backendRisk = null }) => {
	const localRisk = useMemo(() => assessFireRisk(weather), [weather]);
	const risk = backendRisk || localRisk;

	if (!risk) return <div className="help">No weather data available.</div>;

	const needleAngle = angleFromScore(risk.score);

	return (
		<div className="risk-wrap">
			<div className="gauge">
				<div className="needle" style={{ ["--angle" as any]: needleAngle }} />
				<div className="score">
					<div className="num">{Math.round(risk.score)}</div>
					<div className="lvl">{risk.level}</div>
				</div>
			</div>
			<div>
				<div style={{ fontWeight: 700, marginBottom: 6 }}>
					Risk level: <span style={{ color: risk.color }}>{risk.level}</span>
					{backendRisk && (
						<span
							style={{
								marginLeft: 8,
								fontSize: 12,
								color: "var(--ok, #2e8b57)",
							}}
						>
							backend
						</span>
					)}
				</div>
				<p className="help" style={{ maxWidth: 420, lineHeight: 1.4 }}>
					{risk.explanation}
				</p>
			</div>
		</div>
	);
};

export default FireRiskAssessment;
