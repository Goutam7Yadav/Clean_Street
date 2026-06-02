// components/IssueForm.jsx
import React, { useState, useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import api from "../services/api";

function IssueForm({ onIssueCreated }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "Medium",
    location: "",
    latitude: "",
    longitude: "",
    category: "",
  });
  const [photo, setPhoto] = useState(null);
  const [locationError, setLocationError] = useState("");
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  // ✅ Automatically fetch device location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setForm((prev) => ({
            ...prev,
            latitude: latitude.toString(),
            longitude: longitude.toString(),
          }));
        },
        (err) => {
          console.error("Geolocation error:", err);
          setLocationError("Unable to fetch device location. Please allow location access.");
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setLocationError("Geolocation not supported by your browser.");
    }
  }, []);

  const hasCoords =
    form.latitude !== "" &&
    form.longitude !== "" &&
    !isNaN(Number(form.latitude)) &&
    !isNaN(Number(form.longitude));

  // ✅ Initialize / update Leaflet map when coords change
  useEffect(() => {
    if (!mapRef.current) return;
    const lat = Number(form.latitude);
    const lon = Number(form.longitude);

    if (!mapInstanceRef.current) {
      const startLat = isFinite(lat) ? lat : 0;
      const startLon = isFinite(lon) ? lon : 0;
      mapInstanceRef.current = L.map(mapRef.current).setView([startLat, startLon], 15);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(mapInstanceRef.current);

      markerRef.current = L.marker([startLat, startLon]).addTo(mapInstanceRef.current);

      // ✅ Allow user to click map to override location
      mapInstanceRef.current.on("click", (e) => {
        const { lat, lng } = e.latlng;
        setForm((prev) => ({
          ...prev,
          latitude: lat.toString(),
          longitude: lng.toString(),
        }));
        if (markerRef.current) markerRef.current.setLatLng([lat, lng]);
      });
    }

    if (hasCoords) {
      mapInstanceRef.current.setView([lat, lon], 15);
      if (markerRef.current) markerRef.current.setLatLng([lat, lon]);
    }
  }, [form.latitude, form.longitude]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => formData.append(key, value));
      if (photo) formData.append("photo", photo);

      await api.post("/issues", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      alert("✅ Issue reported successfully!");
      setForm({
        title: "",
        description: "",
        priority: "Medium",
        location: "",
        latitude: "",
        longitude: "",
        category: "",
      });
      setPhoto(null);
      if (onIssueCreated) onIssueCreated();
    } catch (err) {
      console.error("❌ Failed to report issue:", err);
      alert("Failed to report issue");
    }
  };

  return (
    <form className="report-form" onSubmit={handleSubmit}>
      <label>Title</label>
      <input
        type="text"
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
        required
      />

      <label>Description</label>
      <textarea
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        required
      />

      <label>Priority</label>
      <select
        value={form.priority}
        onChange={(e) => setForm({ ...form, priority: e.target.value })}
      >
        <option value="Low">Low</option>
        <option value="Medium">Medium</option>
        <option value="High">High</option>
      </select>

      <label>Location Name / Issue Place</label>
      <input
        type="text"
        placeholder="Enter issue location name, landmark, or street"
        value={form.location}
        onChange={(e) => setForm({ ...form, location: e.target.value })}
        required
      />

      <label>Category</label>
      <select
        value={form.category}
        onChange={(e) => setForm({ ...form, category: e.target.value })}
        required
      >
        <option value="">-- Select Category --</option>
        <option value="Garbage">Garbage</option>
        <option value="Road">Road</option>
        <option value="StreetLight">StreetLight</option>
        <option value="Water">Water</option>
        <option value="Sewage">Sewage</option>
        <option value="Park">Park</option>
        <option value="Tree">Tree</option>
        <option value="Parking">Parking</option>
        <option value="Building">Building</option>
        <option value="Other">Other</option>
      </select>

      {locationError && <p style={{ color: "red" }}>{locationError}</p>}

      {hasCoords && (
        <div style={{ marginTop: "20px" }}>
          <label>Map Preview</label>
          <div
            ref={mapRef}
            style={{ width: "100%", height: "300px", border: "1px solid #ccc", borderRadius: "8px" }}
          />
          <p style={{ fontSize: "0.9rem", marginTop: "10px" }}>
            Coordinates: latitude={form.latitude}, longitude={form.longitude}
          </p>
        </div>
      )}

      <label>Upload Issue Photo</label>
      <input type="file" onChange={(e) => setPhoto(e.target.files[0])} />

      <button type="submit">Submit Report</button>
    </form>
  );
}

export default IssueForm;
