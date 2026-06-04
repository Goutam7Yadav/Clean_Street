import React, { useState } from "react";
import { Link, Outlet } from "react-router-dom";
import NotificationsPanel from "./NotificationsPanel"; // ✅ create this component separately
import "../styles/DashboardLayout.css";

function DashboardLayout() {
  const role = localStorage.getItem("role"); // store role after login (admin/volunteer/user)
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2>Clean Street</h2>
        <ul>
          {/* Home points to role-specific dashboard */}
          {role === "user" && <li><Link to="/user-dashboard">Home</Link></li>}
          {role === "volunteer" && <li><Link to="/volunteer-dashboard">Home</Link></li>}
          {role === "admin" && <li><Link to="/admin-dashboard">Home</Link></li>}

          {/* User links */}
          {role === "user" && (
            <>
              <li><Link to="/user-dashboard/report">Report Issue</Link></li>
              <li><Link to="/user-dashboard/issues">My Issues</Link></li>
              <li><Link to="/user-dashboard/profile">Profile</Link></li>
              <li><Link to="/user-dashboard/logout" style={{fontWeight: "bold", color: "red" }} >Logout</Link></li>
            </>
          )}

          {/* Volunteer links */}
          {role === "volunteer" && (
            <>
              <li><Link to="/volunteer-dashboard/tasks">Assigned Tasks</Link></li>
              <li><Link to="/volunteer-dashboard/stats">My Stats</Link></li>
              <li><Link to="/volunteer-dashboard/profile">Profile</Link></li>
              <li><Link to="/volunteer-dashboard/logout" style={{fontWeight: "bold", color: "red" }} >Logout</Link></li>
            </>
          )}

          {/* Admin links */}
          {role === "admin" && (
            <>
              <li><Link to="/admin-dashboard/users">Manage Users</Link></li>
              <li><Link to="/admin-dashboard/issues">All Issues</Link></li>
              <li><Link to="/admin-dashboard/stats">Analytics</Link></li>
              <li><Link to="/admin-dashboard/profile">Profile</Link></li>
              <li><Link to="/admin-dashboard/logout" style={{fontWeight: "bold", color: "red" }} >Logout</Link></li>
            </>
          )}
        </ul>

        {/* ✅ Notification bell at the bottom */}
        <div className="sidebar-bottom">
          <button
            className="notification-btn"
            onClick={() => setShowNotifications(!showNotifications)}
          >📬
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="main-content">
        <Outlet />
      </main>
{showNotifications && (
  <NotificationsPanel className={showNotifications ? "open" : ""} />
)}
    </div>
  );
}

export default DashboardLayout;
