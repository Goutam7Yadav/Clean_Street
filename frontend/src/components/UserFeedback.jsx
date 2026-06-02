import React from "react";
import "../styles/Dashboard.css";

function UserFeedback() {
  return (
    <div className="dashboard user-theme">
      <h1>Feedback</h1>
      <div className="report-section">
        <p>
          This section will show feedback related to your reported issues.
          It is currently a placeholder while feedback collection is wired up.
        </p>
        <ul>
          <li>No feedback entries available yet.</li>
          <li>Once feedback is added, it will appear here grouped by issue.</li>
        </ul>
      </div>
    </div>
  );
}

export default UserFeedback;
