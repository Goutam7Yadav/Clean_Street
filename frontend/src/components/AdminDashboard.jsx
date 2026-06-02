import React, { useEffect, useState } from "react";
import {
  getSummary,
  getVolunteerStats,
  getAvgResolutionTime,
  getVolunteerResolutionTime,
  getComplaintCategories,
  getUserRoles,
  getAllIssues,
  assignIssueToVolunteer,
  getFilteredIssues
} from "../services/issueService"; 
import "../styles/Dashboard.css";
import IssueSummaryChart from "./charts/IssueSummaryChart";
import VolunteerStatsChart from "./charts/VolunteerStatsChart";
import ResolutionTimeChart from "./charts/ResolutionTimeChart";
import ComplaintCategoriesChart from "./charts/ComplaintCategoriesChart";
import UserRolesChart from "./charts/UserRolesChart";
import IssueList from "./IssueList";   
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

function AdminDashboard() {
  const [summary, setSummary] = useState({});
  const [volunteerStats, setVolunteerStats] = useState([]);
  const [avgTime, setAvgTime] = useState(null);
  const [volunteerTimes, setVolunteerTimes] = useState([]);
  const [complaintCategories, setComplaintCategories] = useState({});
  const [userRoles, setUserRoles] = useState({});
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [volunteerId, setVolunteerId] = useState("");
  const [filter, setFilter] = useState("All");
  const [resolutionStats, setResolutionStats] = useState({
  overallAvg: 0,
  volunteers: []
});

  const token = localStorage.getItem("token");

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const summaryRes = await getSummary(token);
      setSummary(summaryRes.data);

      const statsRes = await getVolunteerStats(token);
      setVolunteerStats(statsRes.data);

      const avgRes = await getAvgResolutionTime(token);
      setAvgTime(avgRes.data);

      const volunteerRes = await getVolunteerResolutionTime(token);
      console.log("Volunteer resolution time:", volunteerRes.data);
      setVolunteerTimes(volunteerRes.data);


      const categoriesRes = await getComplaintCategories(token);
      setComplaintCategories(categoriesRes.data);

      const rolesRes = await getUserRoles(token);
      setUserRoles(rolesRes.data);

      let issuesRes;
      if (filter === "All") {
        issuesRes = await getAllIssues(token);
      } else {
        issuesRes = await getFilteredIssues(filter, token);
      }
      setIssues(issuesRes.data || []);
    } catch (err) {
      console.error("❌ Error fetching admin data:", err);
      setError(err);
    }
    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filter]);

  const handleAssign = async () => {
    try {
      await assignIssueToVolunteer(selectedIssue._id, volunteerId, token);
      alert("✅ Issue assigned successfully!");
      setSelectedIssue(null);
      setVolunteerId("");
      fetchData(); 
    } catch (err) {
      console.error("❌ Error assigning issue:", err);
    }
  };

  if (loading) {
    return (
      <div className="dashboard admin-theme">
        <h1>Admin Dashboard</h1>
        <p>Loading admin data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard admin-theme">
        <h1>Admin Dashboard</h1>
        <p style={{ color: 'red' }}>Error loading admin data. Check console for details.</p>
      </div>
    );
  }

  return (
      <div className="dashboard admin-theme">
        <h1>Admin Dashboard</h1>

        {/* Dynamic stats */}
        <div className="stats">
          <div className="card orange">Issues Reported: {summary.totalIssues || 0}</div>
          <div className="card green">Resolved: {summary.resolvedIssues || 0}</div>
          <div className="card red">Pending: {summary.pendingIssues || 0}</div>
          <div className="card blue">In Progress: {summary.inProgressIssues || 0}</div>
        </div>

        {/* Map view of all issues */}
        <div className="map-section">
          <h2>Issue Locations</h2>
          <MapContainer center={[23.2599, 77.4126]} zoom={13} style={{ height: "500px", width: "100%" }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />
            {issues.map(issue => {
              const lat = Number(issue.latitude);
              const lng = Number(issue.longitude);
              if (!isFinite(lat) || !isFinite(lng)) return null;
              return (
                <Marker key={issue._id} position={[lat, lng]}>
                  <Popup>
                    <strong>{issue.title}</strong><br />
                    {issue.description}<br />
                    Status: {issue.status}<br />
                    Category: {issue.category}<br />
                    Priority: {issue.priority}<br />
                    Reported by: {issue.user?.username || "Unknown"}<br />
                    {issue.photo && (
                      <img src={`/uploads/${issue.photo}`} alt="Issue" style={{ width: "100px", marginTop: "5px" }} />
                    )}
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>

        {/* Volunteer stats list */}
        <div className="activity">
          <h2>Volunteer Stats</h2>
          <ul>
            {volunteerStats.map((v, i) => (
              <li key={i}>
                {v.volunteerName} — Resolved: {v.resolvedCount}
              </li>
            ))}
          </ul>
        </div>

        {/* Resolution times list */}
        <div className="activity">
          <h2>Resolution Times</h2>
          <p>Overall Avg: {avgTime?.avgResolutionTimeHours || "No data"} hours</p>
      <ul>
  {Array.isArray(volunteerTimes) &&
    volunteerTimes.map((v, i) => (
      <li key={i}>
        {v.volunteerName} — Avg: {v.avgResolutionTimeHours} hours
      </li>
    ))}
</ul>
        </div>

        {/* All Issues List */}
        <div className="activity">
          <h2>All Reported Issues</h2>
          <IssueList issues={issues} onSelect={(issue) => setSelectedIssue(issue)} />
        </div>


        {/* Static actions */}
        <div className="actions">
          <h2>Quick Actions</h2>
          <button onClick={fetchData}>Refresh Data</button>
        </div>
      </div>
  );
}

export default AdminDashboard;
