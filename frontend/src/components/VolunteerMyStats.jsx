import React, { useEffect, useState } from "react";
import api from "../services/api";
import "../styles/VolunteerStyle.css";

function VolunteerMyStats() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const fetchTasks = async () => {
      const token = localStorage.getItem("token");
      const res = await api.get("/issues", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const volunteerId = localStorage.getItem("userId");
      const myTasks = res.data.filter(issue =>
        issue.assignedTo &&
        (issue.assignedTo._id === volunteerId || issue.assignedTo === volunteerId)
      );
      setTasks(myTasks);
    };
    fetchTasks();
  }, []);

  return (
    <div className="volunteer-stats">
      <h2>My Stats</h2>
      <div className="insideitem">
      <p>Tasks Assigned: {tasks.length}</p>
      <p>Completed: {tasks.filter(t => t.status === "Resolved").length}</p>
      <p>Pending: {tasks.filter(t => t.status === "Pending").length}</p>
      <p>In Progress: {tasks.filter(t => t.status === "In Progress").length}</p>
      </div>
    </div>
  );
}

export default VolunteerMyStats;
