import React from "react";

interface WeatherData {
  temp: number;
  humidity: number;
  wind: number;
}

interface Props {
  data: WeatherData | null;
  loading: boolean;
  error: string | null;
}

const WeatherDisplay: React.FC<Props> = ({ data, loading, error }) => {
  return (
    <section>
      <h2>Current Weather</h2>
      {loading && <p>Loading weather data...</p>}
      {error && !loading && <p style={{ color: 'var(--warn, orange)' }}>{error}</p>}
      {data && !loading && (
        <>
          <p>Temperature: {data.temp}°C</p>
          <p>Humidity: {data.humidity}%</p>
          <p>Wind Speed: {data.wind} m/s</p>
        </>
      )}
      {!data && !loading && !error && <p>No data.</p>}
    </section>
  );
};

export default WeatherDisplay;
