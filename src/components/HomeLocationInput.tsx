import React, { useState } from "react";

type Props = {
	onLocationSet: (lat: number, lon: number, label?: string) => void;
};

const HomeLocationInput: React.FC<Props> = ({ onLocationSet }) => {
	const [address, setAddress] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		if (!address.trim()) return;
		setLoading(true);
		try {
			const res = await fetch(`/api/geocode?q=${encodeURIComponent(address)}`);
			if (!res.ok) throw new Error(`Geocode failed (${res.status})`);
			const data = await res.json();
			onLocationSet(data.lat, data.lon, data.display_name);
			setAddress("");
		} catch (err: any) {
			setError(err.message || "Error fetching location");
		} finally {
			setLoading(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
			<label style={{ fontWeight: 600 }}>
				Enter address:
				<input
					type="text"
					value={address}
					onChange={(e) => setAddress(e.target.value)}
					placeholder="123 Main St, Honolulu, HI"
					style={{ marginLeft: 8, minWidth: 260 }}
				/>
			</label>
			<div style={{ display: "flex", gap: 8 }}>
				<button type="submit" disabled={loading}>
					{loading ? "Searching…" : "Set Location"}
				</button>
				<button
					type="button"
					onClick={() => {
						setAddress("");
						setError("");
					}}
					disabled={loading}
				>
					Clear
				</button>
			</div>
			{error && <p style={{ color: "var(--warn, #c99700)" }}>{error}</p>}
		</form>
	);
};

export default HomeLocationInput;
