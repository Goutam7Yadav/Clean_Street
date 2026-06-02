// src/components/UserDashboard.jsx
import React, { useEffect, useState } from "react";
import api from "../services/api";
import "../styles/Dashboard.css";

function UserDashboard() {
  const [summary, setSummary] = useState({});
  const [recentIssues, setRecentIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");

      // Overall issue summary
      const resSummary = await api.get("/user/issues/summary", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSummary(resSummary.data);

      // Global recent issues
      const resRecent = await api.get("/issues/recent", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRecentIssues(resRecent.data);
    } catch (err) {
      console.error("❌ Error loading dashboard:", err);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="dashboard user-theme">
      <h1>User Dashboard</h1>

      {/* Stats cards */}
      <div className="stats">
        <div className="card orange">Total Reported: {summary.totalIssues || 0}</div>
        <div className="card green">Resolved: {summary.resolvedIssues || 0}</div>
        <div className="card red">Pending: {summary.pendingIssues || 0}</div>
        <div className="card blue">In Progress: {summary.inProgressIssues || 0}</div>
      </div>

      {/* Recent Reports */}
      <div className="activity">
        <h2>Recent Reports</h2>
        {loading ? (
          <p>Loading issues...</p>
        ) : recentIssues.length ? (
          <div className="recent-list">
            {recentIssues.slice(0, 5).map((issue) => (
              <div key={issue._id} className="recent-card">
                <h3>{issue.title}</h3>
                {issue.photo && (
                  <img
                    src={`http://localhost:5000/uploads/${issue.photo}`}
                    alt={issue.title}
                    className="recent-photo"
                  />
                )}
                <p className="recent-date">
                  Reported on: {new Date(issue.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p>No recent issues found.</p>
        )}
      </div>
    </div>
  );
}

export default UserDashboard;
