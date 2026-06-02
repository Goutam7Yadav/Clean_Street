// components/IssueList.jsx
import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

function IssueList({ issues, onSelect }) {
  return (
    <div className="issue-list">
      {issues.map((item) => {
        const hasCoords =
          item.latitude !== undefined &&
          item.longitude !== undefined &&
          item.latitude !== null &&
          item.longitude !== null &&
          item.latitude !== "" &&
          item.longitude !== "";

        return (
          <div key={item._id} className="issue-card">
            <h3>{item.title}</h3>
            <p>{item.description}</p>
            <p>
              <strong>Status:</strong> {item.status} | <strong>Category:</strong>{" "}
              {item.category} | <strong>Priority:</strong>{" "}
              {item.priority || "Medium"}
            </p>
            <p>
              <strong>Location:</strong> {item.location}
              {hasCoords ? ` (${item.latitude}, ${item.longitude})` : ""}
            </p>

            {/* Live Map instead of static image */}
            {hasCoords && (
              <MapContainer
                center={[item.latitude, item.longitude]}
                zoom={15}
                style={{
                  height: "200px",
                  width: "100%",
                  maxWidth: "400px",
                  marginTop: "10px",
                  borderRadius: "8px",
                }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="&copy; OpenStreetMap contributors"
                />
                <Marker position={[item.latitude, item.longitude]}>
                  <Popup>{item.title}</Popup>
                </Marker>
              </MapContainer>
            )}

            {/* {onSelect && (
              <button
                onClick={() => onSelect(item)}
                style={{ marginTop: "10px" }}
              >
                Select to Assign
              </button>
            )} */}

            {item.photo && (
              <img
                src={`http://localhost:5000/uploads/${item.photo}`}
                alt="Issue"
                style={{ width: "100px", marginTop: "10px" }}
              />
            )}
            {item.completionPhoto && (
              <img
                src={`http://localhost:5000/uploads/completion/${item.completionPhoto}`}
                alt="Resolved"
                style={{ width: "100px", marginTop: "10px", marginLeft: "10px" }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default IssueList;
