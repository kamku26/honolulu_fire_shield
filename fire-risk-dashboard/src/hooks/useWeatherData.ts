import { useState, useEffect } from "react";

export function useWeatherData(lat: number | null, lon: number | null) {
	const [weather, setWeather] = useState<{
		temp: number;
		humidity: number;
		wind: number;
	} | null>(null);

	useEffect(() => {
		if (lat === null || lon === null) return;

		// Example: Open-Meteo API (no key required)
		fetch(
			`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
		)
			.then((res) => res.json())
			.then((data) => {
				const w = data.current_weather;
				setWeather({
					temp: w.temperature,
					humidity: w.relative_humidity ?? 0,
					wind: w.windspeed,
				});
			});
	}, [lat, lon]);

	return weather;
}
