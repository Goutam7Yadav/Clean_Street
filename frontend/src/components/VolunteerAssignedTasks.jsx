import React, { useEffect, useState } from "react";
import api from "../services/api";
import "../styles/VolunteerStyle.css";

function VolunteerAssignedTasks() {
  const [tasks, setTasks] = useState([]);
  const [completionPhoto, setCompletionPhoto] = useState(null);
  const [expandedTask, setExpandedTask] = useState(null); // track which task is expanded

  const fetchTasks = async () => {
    try {
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
    } catch (err) {
      console.error("❌ Error fetching tasks:", err);
    }
  };

  useEffect(() => { fetchTasks(); }, []);

  const handleStart = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await api.put(`/issues/${id}/start`, {}, { headers: { Authorization: `Bearer ${token}` } });
      fetchTasks();
    } catch (err) {
      console.error("❌ Error starting issue:", err);
    }
  };

  const handleResolve = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      if (completionPhoto) formData.append("completionPhoto", completionPhoto);
      await api.put(`/issues/${id}/resolve`, formData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" }
      });
      setCompletionPhoto(null);
      fetchTasks();
    } catch (err) {
      console.error("❌ Error resolving issue:", err);
    }
  };

  const handlePending = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await api.put(`/issues/${id}/pending`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTasks();
    } catch (err) {
      console.error("❌ Error reopening issue:", err);
    }
  };

  return (
    <div className="volunteerAssigntask">
      <h2>My Assigned Tasks</h2>
      {tasks.map(task => (
        <div key={task._id} className="task-card" style={{border:"1px solid #b7b7b7", padding:"10px", margin:"10px 0"}}>
          <h3>{task.title}</h3>
          <p>Status: {task.status}</p>

          {/* Toggle details */}
          <button onClick={() => setExpandedTask(expandedTask === task._id ? null : task._id)}>
            {expandedTask === task._id ? "Hide Details" : "View Details"}
          </button>

          {expandedTask === task._id && (
            <div className="task-details" style={{marginTop:"10px"}}>
              <p><strong>Description:</strong> {task.description}</p>
              <p><strong>Location:</strong> {task.location}</p>
              <p><strong>Category:</strong> {task.category}</p>
              <p><strong>Priority:</strong> {task.priority}</p>
              {task.photo && (
                <img
                  src={`/uploads/${task.photo}`}
                  alt="Issue"
                  style={{ width: "150px", marginTop: "5px" }}
                />
              )}
            </div>
          )}

          {/* Action buttons */}
          {task.status === "Pending" && (
            <button onClick={() => handleStart(task._id)}>Start</button>
          )}

          {task.status === "In Progress" && (
            <>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setCompletionPhoto(e.target.files[0])}
              />
              <button onClick={() => handleResolve(task._id)}>Resolve</button>
              <button onClick={() => handlePending(task._id)}>Reopen</button>
            </>
          )}

          {task.status === "Resolved" && (
            <button onClick={() => handlePending(task._id)}>Reopen</button>
          )}
        </div>
      ))}
    </div>
  );
}

export default VolunteerAssignedTasks;
