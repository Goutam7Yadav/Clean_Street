import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/DashboardLayout.css"; // reuse your existing styles

function NotificationsPanel() {
  const [notifications, setNotifications] = useState([]);

useEffect(() => {
  async function fetchNotifications() {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/api/notifications", {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Ensure it's always an array
      const data = Array.isArray(res.data) ? res.data : [];
      setNotifications(data);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setNotifications([]); // fallback to empty array
    }
  }
  fetchNotifications();
}, []);


  return (
    <div className="notifications-panel">
      <h3>Notifications</h3>
      {notifications.length === 0 ? (
        <p>No notifications available</p>
      ) : (
        <ul>
          {notifications.map(n => (
            <li key={n._id}>
              {n.message}{" "}
              <small>{new Date(n.createdAt).toLocaleString()}</small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default NotificationsPanel;
