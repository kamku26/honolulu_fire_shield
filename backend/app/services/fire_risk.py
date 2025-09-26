from dataclasses import dataclass

@dataclass
class FireRiskResult:
    score: float  # 0-100
    level: str
    explanation: str
    color: str

LEVEL_COLORS = {
    "Low": "#2e8b57",
    "Moderate": "#e0c200",
    "High": "#ff8c00",
    "Very High": "#ff4500",
    "Extreme": "#8b0000",
}


def map_score_to_level(score: int) -> FireRiskResult:
    level = "Low"
    if score >= 7:
        level = "Extreme"
    elif score >= 5:
        level = "Very High"
    elif score >= 4:
        level = "High"
    elif score >= 2:
        level = "Moderate"

    explanation = {
        "Low": "Conditions are safe. Minimal fire risk.",
        "Moderate": "Be cautious. Some factors may increase fire risk.",
        "High": "High chance of fire spread. Avoid open flames.",
        "Very High": "Conditions are dangerous. Fires can spread rapidly.",
        "Extreme": "Critical fire risk. Any fire could become uncontrollable.",
    }[level]

    scaled = score * 10  # 0-90 currently per frontend logic
    return FireRiskResult(
        score=scaled,
        level=level,
        explanation=explanation,
        color=LEVEL_COLORS[level],
    )


def compute_fire_risk(temp: float, humidity: float, wind: float) -> FireRiskResult:
    score = 0
    if temp > 30:
        score += 3
    elif temp > 25:
        score += 2
    elif temp > 20:
        score += 1

    if humidity < 20:
        score += 3
    elif humidity < 35:
        score += 2
    elif humidity < 50:
        score += 1

    if wind > 15:
        score += 3
    elif wind > 8:
        score += 2
    elif wind > 4:
        score += 1

    return map_score_to_level(score)
