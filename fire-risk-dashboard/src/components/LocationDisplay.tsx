import React from "react";

const LocationDisplay: React.FC = () => {
	// Placeholder for location info
	return (
		<section>
			<h2>Your Locations</h2>
			<ul>
				<li>Current Location: (loading...)</li>
				<li>Home: (set up your home location)</li>
			</ul>
		</section>
	);
};

export default LocationDisplay;
