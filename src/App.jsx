import React, { useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvent,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Modern blue Google Maps-style SVG pin
const goodPinSvg = `<svg width="32" height="48" viewBox="0 0 32 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 0C8.268 0 2 6.268 2 14c0 9.941 12.09 31.02 12.602 31.89a2 2 0 0 0 3.196 0C17.91 45.02 30 23.941 30 14c0-7.732-6.268-14-14-14zm0 21a7 7 0 1 1 0-14 7 7 0 0 1 0 14z" fill="#2563eb" stroke="#1e40af" stroke-width="2"/><circle cx="16" cy="14" r="5" fill="#fff"/></svg>`;

const customIcon = new L.Icon({
  iconUrl: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(goodPinSvg)}`,
  iconSize: [32, 48],
  iconAnchor: [16, 48],
  popupAnchor: [0, -48],
  shadowUrl: undefined,
});

function MapClickHandler({ setLocations }) {
  useMapEvent("click", (e) => {
    const { lat, lng } = e.latlng;
    setLocations((prev) => [
      { ...prev[0], position: [lat, lng] },
      prev[1],
    ]);
  });
  return null;
}

const App = () => {
  const [locations, setLocations] = useState([
    { name: "Point A", position: [17.385044, 78.678971] }, // Hyderabad
    { name: "Point B", position: [17.443161, 78.377235] }, // Gachibowli
  ]);

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <MapContainer
        center={locations[0].position}
        zoom={12}
        style={{ height: "100%", width: "100%" }}
      >
        <MapClickHandler setLocations={setLocations} />
        {/* Dark theme */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">Carto</a>'
        />

        {/* Markers */}
        {locations.map((loc, idx) => (
          <Marker key={idx} position={loc.position} icon={customIcon}>
            <Popup>{loc.name}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default App;
