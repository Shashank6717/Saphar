import React, { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvent,
  useMap,
  Tooltip,
} from "react-leaflet";
import L from "leaflet";
import "./App.css";
import "leaflet/dist/leaflet.css";
import SearchBar from "./components/SearchBar";
// Modern blue Google Maps-style SVG pin
const goodPinSvg = `<svg width="32" height="48" viewBox="0 0 32 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 0C8.268 0 2 6.268 2 14c0 9.941 12.09 31.02 12.602 31.89a2 2 0 0 0 3.196 0C17.91 45.02 30 23.941 30 14c0-7.732-6.268-14-14-14zm0 21a7 7 0 1 1 0-14 7 7 0 0 1 0 14z" fill="#2563eb" stroke="#1e40af" stroke-width="2"/><circle cx="16" cy="14" r="5" fill="#fff"/></svg>`;
const redPinSvg = `<svg width="32" height="48" viewBox="0 0 32 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 0C8.268 0 2 6.268 2 14c0 9.941 12.09 31.02 12.602 31.89a2 2 0 0 0 3.196 0C17.91 45.02 30 23.941 30 14c0-7.732-6.268-14-14-14zm0 21a7 7 0 1 1 0-14 7 7 0 0 1 0 14z" fill="#ef4444" stroke="#b91c1c" stroke-width="2"/><circle cx="16" cy="14" r="5" fill="#fff"/></svg>`;

const customIcon = new L.Icon({
  iconUrl: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(goodPinSvg)}`,
  iconSize: [32, 48],
  iconAnchor: [16, 48],
  popupAnchor: [0, -48],
  shadowUrl: undefined,
});
const redIcon = new L.Icon({
  iconUrl: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(redPinSvg)}`,
  iconSize: [32, 48],
  iconAnchor: [16, 48],
  popupAnchor: [0, -48],
  shadowUrl: undefined,
});

function MapClickHandler({ setLocations, addMode, locations, onAddPoint }) {
  useMapEvent("click", (e) => {
    if (!addMode) return;
    const { lat, lng } = e.latlng;
    setLocations((prev) => [
      ...prev,
      { name: `Point ${prev.length + 1}`, position: [lat, lng] },
    ]);
    onAddPoint(lat, lng);
  });
  return null;
}

function MapController({ center }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
  }, [center, map]);
  return null;
}

const App = () => {
  const [locations, setLocations] = useState([]); // No default points
  const [mapCenter, setMapCenter] = useState([20, 0]); // Default to world view
  const [searchedLocation, setSearchedLocation] = useState(null);
  const [addMode, setAddMode] = useState(false); // Toggle for adding points
  const [showModal, setShowModal] = useState(false); // Modal visibility
  const [modalLocation, setModalLocation] = useState(null); // Location for modal
  const [areaName, setAreaName] = useState(""); // Area/location name for modal
  const [tripForm, setTripForm] = useState({
    tripName: '',
    date: '',
    description: '',
  });
  const [modalMode, setModalMode] = useState("add"); // "add" or "view"
  const [modalTrip, setModalTrip] = useState(null); // The trip object for view mode

  // Handler to open modal when a new point is added
  const handleAddPoint = async (lat, lng) => {
    setModalLocation([lat, lng]);
    setShowModal(true);
    setModalMode("add");
    setTripForm({ tripName: '', date: '', description: '' });
    setAreaName("Loading...");
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await response.json();
      setAreaName(data.display_name || "Unknown location");
    } catch {
      setAreaName("Unknown location");
    }
  };

  // Save trip info with the point
  const handleTripSubmit = (e) => {
    e.preventDefault();
    setLocations(prev => [
      ...prev,
      {
        tripName: tripForm.tripName,
        date: tripForm.date,
        description: tripForm.description,
        areaName,
        position: modalLocation,
      }
    ]);
    setShowModal(false);
    setTripForm({ tripName: '', date: '', description: '' });
    setAreaName('');
    setModalLocation(null);
  };

  // Open modal in view mode for a marker
  const handleMarkerClick = (trip) => {
    setModalTrip(trip);
    setShowModal(true);
    setModalMode("view");
  };

  return (
    <div style={{ height: "100vh", width: "100%" }} className="relative">
      {/* Modal and Blur Overlay */}
      {showModal && (
        <>
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              background: 'rgba(255,255,255,0.4)',
              backdropFilter: 'blur(8px)',
              zIndex: 2000,
            }}
          />
          <div
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '60vw',
              minHeight: '40vh',
              background: '#fff',
              borderRadius: 24,
              boxShadow: '0 8px 32px rgba(37,99,235,0.18)',
              zIndex: 2100,
              padding: 0,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div style={{ width: '100%', height: 8, background: '#2563eb' }} />
            <div style={{ padding: '40px 32px 32px 32px', width: '100%' }}>
              <h2 style={{ marginBottom: 18, fontSize: 32, fontWeight: 700, color: '#2563eb', textAlign: 'center', letterSpacing: 1 }}>
                {modalMode === "add" ? "Add Trip Details" : "Trip Details"}
              </h2>
              <div style={{ marginBottom: 18, textAlign: 'center' }}>
                <div style={{ fontWeight: 500, fontSize: 18, marginBottom: 6, color: '#222' }}>
                  {modalMode === "add" ? areaName : modalTrip?.areaName}
                </div>
                <div style={{ color: '#666', fontSize: 15 }}>
                  {(modalMode === "add" ? modalLocation : modalTrip?.position)?.map((v, i) => v && v.toFixed ? v.toFixed(5) : v).join(', ')}
                </div>
              </div>
              {modalMode === "add" ? (
                <form style={{ display: 'flex', flexDirection: 'column', gap: 18, marginTop: 12 }} onSubmit={handleTripSubmit}>
                  <div style={{ display: 'flex', gap: 16 }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontWeight: 500, color: '#2563eb', marginBottom: 4, display: 'block' }}>Trip Name</label>
                      <input
                        type="text"
                        value={tripForm.tripName}
                        onChange={e => setTripForm(f => ({ ...f, tripName: e.target.value }))}
                        placeholder="e.g. Family Vacation"
                        required
                        style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #d1d5db', fontSize: 15 }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontWeight: 500, color: '#2563eb', marginBottom: 4, display: 'block' }}>Date</label>
                      <input
                        type="date"
                        value={tripForm.date}
                        onChange={e => setTripForm(f => ({ ...f, date: e.target.value }))}
                        required
                        style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #d1d5db', fontSize: 15 }}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={{ fontWeight: 500, color: '#2563eb', marginBottom: 4, display: 'block' }}>Description</label>
                    <textarea
                      value={tripForm.description}
                      onChange={e => setTripForm(f => ({ ...f, description: e.target.value }))}
                      placeholder="Describe your trip..."
                      rows={3}
                      style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #d1d5db', fontSize: 15, resize: 'vertical' }}
                    />
                  </div>
                  <button type="submit" style={{ marginTop: 32, padding: '10px 32px', borderRadius: 8, background: '#2563eb', color: '#fff', border: 'none', fontWeight: 600, fontSize: 16, boxShadow: '0 2px 8px rgba(37,99,235,0.08)' }}>Save</button>
                </form>
              ) : (
                <div style={{ marginTop: 12 }}>
                  <div style={{ marginBottom: 12 }}>
                    <strong>Trip Name:</strong> {modalTrip?.tripName}
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <strong>Date:</strong> {modalTrip?.date}
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <strong>Description:</strong> {modalTrip?.description}
                  </div>
                </div>
              )}
              <button onClick={() => setShowModal(false)} style={{ marginTop: 24, padding: '10px 32px', borderRadius: 8, background: '#2563eb', color: '#fff', border: 'none', fontWeight: 600, fontSize: 16, boxShadow: '0 2px 8px rgba(37,99,235,0.08)' }}>Close</button>
            </div>
          </div>
        </>
      )}
      {/* Toggle Switch - Bottom Right Corner */}
      <div style={{ position: 'absolute', bottom: 30, right: 30, zIndex: 1000 }}>
        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }}>
          <span style={{ marginRight: 12, fontWeight: 500 }}>Add Points Mode</span>
          <span style={{ position: 'relative', display: 'inline-block', width: 56, height: 32 }}>
            <input
              type="checkbox"
              checked={addMode}
              onChange={e => setAddMode(e.target.checked)}
              style={{ opacity: 0, width: 0, height: 0 }}
            />
            <span
              style={{
                position: 'absolute',
                cursor: 'pointer',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: addMode ? '#2563eb' : '#ccc',
                borderRadius: 32,
                transition: 'background 0.2s',
              }}
            ></span>
            <span
              style={{
                position: 'absolute',
                left: addMode ? 28 : 4,
                top: 4,
                width: 24,
                height: 24,
                background: '#fff',
                borderRadius: '50%',
                boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
                transition: 'left 0.2s',
              }}
            ></span>
          </span>
        </label>
      </div>
      <SearchBar setMapCenter={setMapCenter} setSearchedLocation={setSearchedLocation} locations={locations} />
      <MapContainer
        center={mapCenter}
        zoom={12}
        style={{ height: "100%", width: "100%" }}
      >
        <MapController center={mapCenter} />
        <MapClickHandler setLocations={setLocations} addMode={addMode} locations={locations} onAddPoint={handleAddPoint} />
        {/* Dark theme */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">Carto</a>'
        />
        {/* Markers */}
        {locations.map((loc, idx) => (
          <Marker
            key={idx}
            position={loc.position}
            icon={customIcon}
            eventHandlers={{
              click: () => handleMarkerClick(loc)
            }}
          >
            <Tooltip>{loc.tripName}</Tooltip>
          </Marker>
        ))}
        {searchedLocation && (
          <Marker position={searchedLocation} icon={redIcon}>
            <Popup>Searched Location</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

export default App;
