import React, { useEffect, useState } from "react";
import axios from "axios";

function Dashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    axios.get("http://localhost:5000/api/auth/profile", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
    .then(res => setUser(res.data))
    .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <h2>Dashboard</h2>
      {user ? (
        <p>Welcome {user.name}, role: {user.role}</p>
      ) : (
        <p>Loading user info...</p>
      )}
    </div>
  );
}

export default Dashboard;
