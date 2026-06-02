import React, { useEffect, useState } from "react";
import api from "../services/api";
import IssueList from "./IssueList";
import "../styles/Dashboard.css";

function UserMyIssues() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchIssues = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/issues", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIssues(res.data);
    } catch (err) {
      console.error("❌ Error loading issues:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  return (
    <div className="dashboard user-theme">
      <h1>My Issues</h1>
      <div className="activity">
        <h2>Your Reported Issues</h2>
        {loading ? (
          <p>Loading your issues...</p>
        ) : issues.length ? (
          <IssueList issues={issues} />
        ) : (
          <p>No reported issues found.</p>
        )}
      </div>
    </div>
  );
}

export default UserMyIssues;
