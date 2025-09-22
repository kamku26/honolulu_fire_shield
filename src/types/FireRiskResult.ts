export type FireRiskLevel =
	| "Low"
	| "Moderate"
	| "High"
	| "Very High"
	| "Extreme";

export interface FireRiskResult {
	score: number; // 0–100 (scaled score for the gauge)
	level: FireRiskLevel; // text label of the risk
	explanation: string; // human-readable explanation
	color: string; // CSS color (used for text/accents)
}
