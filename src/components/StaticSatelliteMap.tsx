import React from 'react';

interface StaticSatelliteMapProps {
    lat: number | null;
    lon: number | null;
    zoom?: number; // 0-22 (Mapbox typical range)
    width?: number; // pixels (max 1280 w for free tier usually)
    height?: number; // pixels (max 1280 h for free tier usually)
    marker?: boolean;
    className?: string;
}

// Note: Requires REACT_APP_MAPBOX_TOKEN in environment.
// Usage: <StaticSatelliteMap lat={lat} lon={lon} />
export const StaticSatelliteMap: React.FC<StaticSatelliteMapProps> = ({
    lat,
    lon,
    zoom = 13,
    width = 600,
    height = 300,
    marker = true,
    className
}) => {
    if (lat == null || lon == null) {
        return <div className={className} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1e2633', color: '#8899aa', borderRadius: 8, minHeight: height }}>No coordinates</div>;
    }
    const token = process.env.REACT_APP_MAPBOX_TOKEN;
    if (!token) {
        return <div className={className} style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center', justifyContent: 'center', background: '#1e2633', color: '#ffcc66', border: '1px dashed #445', borderRadius: 8, padding: 12, minHeight: height }}>
            <strong>Mapbox token missing</strong>
            <span style={{ fontSize: 12 }}>Set REACT_APP_MAPBOX_TOKEN in your env to enable satellite imagery.</span>
        </div>;
    }

    // Mapbox static API expects lon,lat in path segment.
    const markerPart = marker ? `pin-s+ff0000(${lon},${lat})/` : '';
    const url = `https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/${markerPart}${lon},${lat},${zoom},0/${width}x${height}?access_token=${token}`;

    return (
        <figure className={className} style={{ margin: 0 }}>
            <img
                src={url}
                alt={`Satellite imagery at ${lat}, ${lon}`}
                width={width}
                height={height}
                style={{ display: 'block', width: '100%', height: 'auto', borderRadius: 8, objectFit: 'cover', background: '#0d1117' }}
            />
            <figcaption style={{ fontSize: 10, opacity: 0.6, marginTop: 4, textAlign: 'right' }}>Imagery © Mapbox © OpenStreetMap © Maxar</figcaption>
        </figure>
    );
};
