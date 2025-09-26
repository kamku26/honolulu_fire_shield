import { useState, useEffect } from "react";

interface WeatherData {
	temp: number;
	humidity: number;
	wind: number;
}

interface WeatherState {
	data: WeatherData | null;
	loading: boolean;
	error: string | null;
	fireRisk?: {
		score: number;
		level: string;
		explanation: string;
		color: string;
	} | null;
}

export function useWeatherData(lat: number | null, lon: number | null): WeatherState {
	const [state, setState] = useState<WeatherState>({ data: null, loading: false, error: null, fireRisk: null });

	useEffect(() => {
		if (lat === null || lon === null) return;
		let cancelled = false;
		setState(s => ({ ...s, loading: true, error: null }));

		const backendUrl = `/api/weather`; // expecting frontend dev proxy or same origin in prod

		const fetchBackend = async () => {
			try {
				const resp = await fetch(backendUrl, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ lat, lon })
				});
				if (!resp.ok) throw new Error(`Backend ${resp.status}`);
				const data = await resp.json();
				if (cancelled) return;
				setState({ data: data.weather, loading: false, error: null, fireRisk: data.fireRisk });
			} catch (e: any) {
				// Fallback to direct provider fetch
				const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=relativehumidity_2m`;
				try {
					const r2 = await fetch(url);
					const d2 = await r2.json();
					const cw = d2.current_weather;
					const times: string[] = d2.hourly?.time ?? [];
					const humValues: number[] = d2.hourly?.relativehumidity_2m ?? [];
					let humidity: number | null = null;
					const cwTime: string | undefined = cw?.time;
					if (cwTime && times.length && humValues.length) {
						// 1. Direct match
						const directIdx = times.indexOf(cwTime);
						if (directIdx !== -1) {
							humidity = humValues[directIdx];
						} else {
							// 2. Nearest time match (parse ISO strings)
							try {
								const target = new Date(cwTime).getTime();
								let bestIdx = -1;
								let bestDiff = Infinity;
								for (let i = 0; i < times.length; i++) {
									const t = new Date(times[i]).getTime();
									const diff = Math.abs(t - target);
									if (diff < bestDiff) { bestDiff = diff; bestIdx = i; }
								}
								if (bestIdx !== -1) humidity = humValues[bestIdx];
							} catch { }
							// 3. Fallback last value
							if (humidity == null && humValues.length) humidity = humValues[humValues.length - 1];
						}
					}
					if (humidity == null) humidity = 50; // neutral fallback
					// Clamp
					humidity = Math.min(100, Math.max(0, humidity));
					if (!cancelled) {
						setState({
							data: { temp: cw.temperature, humidity, wind: cw.windspeed },
							loading: false,
							error: `Backend unavailable (${e?.message || 'error'})`,
							fireRisk: null
						});
					}
				} catch (inner: any) {
					if (!cancelled) setState({ data: null, loading: false, error: inner?.message || 'Failed to fetch weather', fireRisk: null });
				}
			}
		};

		fetchBackend();
		return () => { cancelled = true; };
	}, [lat, lon]);

	return state;
}
