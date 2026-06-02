import React from "react";
import { Link } from "react-router-dom";
import "../styles/Dashboard.css";

function Unauthorized() {
  return (
    <div className="unauthorized-page">
      <h1>🚫 Access Denied</h1>
      <p>You do not have permission to view this page.</p>
      <p>Please check your account role or contact the administrator.</p>

      <div className="actions">
        <Link to="/login">
          <button>Go to Login</button>
        </Link>
        <Link to="/">
          <button>Return Home</button>
        </Link>
      </div>
    </div>
  );
}

export default Unauthorized;
