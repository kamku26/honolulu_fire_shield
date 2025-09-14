import React from "react";
import { useLiveLocation } from "../hooks/useLiveLocation";
import { useWeatherData } from "../hooks/useWeatherData";

type Props = {
	weather: {
		temp: number;
		humidity: number;
		wind: number;
	} | null;
};

const WeatherDisplay: React.FC<Props> = () => {
	const location = useLiveLocation();
	const weather = useWeatherData(location?.lat ?? null, location?.lon ?? null);

	return (
		<section>
			<h2>Current Weather</h2>
			{weather ? (
				<>
					<p>Temperature: {weather.temp}°C</p>
					<p>Humidity: {weather.humidity}%</p>
					<p>Wind Speed: {weather.wind} m/s</p>
				</>
			) : (
				<p>Loading weather data...</p>
			)}
		</section>
	);
};

export default WeatherDisplay;
