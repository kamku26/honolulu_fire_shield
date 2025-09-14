import React, { useState } from "react";

type Props = {
	onLocationSet: (lat: number, lon: number) => void;
};

const HomeLocationInput: React.FC<Props> = ({ onLocationSet }) => {
	const [address, setAddress] = useState("");
	const [error, setError] = useState("");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		// Use OpenStreetMap Nominatim API for geocoding
		const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
			address
		)}`;
		try {
			const res = await fetch(url);
			const data = await res.json();
			if (data && data.length > 0) {
				const { lat, lon } = data[0];
				onLocationSet(parseFloat(lat), parseFloat(lon));
			} else {
				setError("Address not found.");
			}
		} catch {
			setError("Error fetching location.");
		}
	};

	return (
		<form onSubmit={handleSubmit}>
			<label>
				Enter your home address:
				<input
					type="text"
					value={address}
					onChange={(e) => setAddress(e.target.value)}
					placeholder="123 Main St, Honolulu, HI"
				/>
			</label>
			<button type="submit">Set Location</button>
			{error && <p style={{ color: "red" }}>{error}</p>}
		</form>
	);
};

export default HomeLocationInput;
