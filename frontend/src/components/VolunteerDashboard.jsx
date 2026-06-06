import React, { useEffect, useState } from "react";
import api from "../services/api";
import "../styles/Dashboard.css";
import IssueList from "./IssueList"; 
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "../styles/VolunteerStyle.css";

function VolunteerDashboard() {
  const [tasks, setTasks] = useState([]);
  const [completionPhoto, setCompletionPhoto] = useState(null);

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/issues", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const volunteerId = localStorage.getItem("userId");
      const myTasks = res.data.filter(issue => 
        issue.assignedTo && 
        (issue.assignedTo._id === volunteerId || issue.assignedTo === volunteerId)
      );
      // ✅ Sort tasks by createdAt descending (newest first)
      const sortedTasks = myTasks.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setTasks(myTasks);
    } catch (err) {
      console.error("❌ Error fetching volunteer tasks:", err);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleResolve = async (taskId) => {
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      if (completionPhoto) formData.append("completionPhoto", completionPhoto);

      await api.put(`/issues/${taskId}/resolve`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });

      alert("✅ Task resolved successfully!");
      setCompletionPhoto(null);
      fetchTasks(); 
    } catch (err) {
      console.error("❌ Error resolving task:", err);
    }
  };

  return (
    <div className="dashboard volunteer-theme">
      <h1>Volunteer Dashboard</h1>

      {/* Dynamic stats */}
      <div className="stats">
        <div className="card blue">Tasks Assigned: {tasks.length}</div>
        <div className="card green">
          Completed: {tasks.filter(t => t.status === "Resolved").length}
        </div>
        <div className="card red">
          Pending: {tasks.filter(t => t.status !== "Resolved").length}
        </div>
      </div>

      {/* Map view of assigned tasks */}
      <div className="map-section">
        <h2>Issue Locations</h2>
        <MapContainer center={[23.2599, 77.4126]} zoom={13} style={{ height: "400px", width: "100%" }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
          {tasks.map(task => (
            task.latitude && task.longitude ? (
              <Marker key={task._id} position={[task.latitude, task.longitude]}>
                <Popup>
                  <strong>{task.title}</strong><br />
                  {task.description}<br />
                  Status: {task.status}<br />
                  {task.photo && (
                    <img src={`/uploads/${task.photo}`} alt="Issue" style={{ width: "100px", marginTop: "5px" }} />
                  )}
                </Popup>
              </Marker>
            ) : null
          ))}
        </MapContainer>
      </div>

      {/* Assigned tasks list */}
      <div className="activity">
        <h2>My Assigned Tasks</h2>
        <IssueList issues={tasks} />
      </div>    
    </div>
  );
}

export default VolunteerDashboard;
