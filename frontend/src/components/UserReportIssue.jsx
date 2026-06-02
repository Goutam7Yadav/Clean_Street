import React, { useState, useEffect } from "react";
import "../styles/Dashboard.css";
import IssueForm from "./IssueForm";

function UserReportIssue() {
  const [position, setPosition] = useState([23.2599, 77.4126]); // default coords (Bhopal)
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPosition([pos.coords.latitude, pos.coords.longitude]);
          setLoading(false);
        },
        (err) => {
          console.error("Geolocation error:", err);
          setLoading(false);
        }
      );
    } else {
      console.warn("Geolocation not supported");
      setLoading(false);
    }
  }, []);

  return (
    <div className="dashboard user-theme">
      <h1>Report Issue</h1>
      <div className="report-section">
        <p>Enter the details below to report a new issue in your area.</p>

        {/* Pass position into IssueForm */}
        <IssueForm position={position} />
      </div>
    </div>
  );
}

export default UserReportIssue;
