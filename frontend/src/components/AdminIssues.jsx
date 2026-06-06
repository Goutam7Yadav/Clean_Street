import React, { useEffect, useState } from "react";
import { getIssues, getIssuesByStatus } from "../services/adminService";
import { useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";

function AdminIssues() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const fetchIssues = async (status) => {
    try {
      setLoading(true);
      let res;
      if (status) {
        res = await getIssuesByStatus(status, token);
      } else {
        res = await getIssues(token);
      }
      /*--- */
      const data = Array.isArray(res.data) ? res.data : res.data.issues || [];
      // ✅ Sort newest first
      const sortedIssues = data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setIssues(sortedIssues);
      /*--- */
      //setIssues(Array.isArray(res.data) ? res.data : res.data.issues || []);
    } catch (err) {
      console.error("❌ Error fetching issues:", err);
      setIssues([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues(); // load all issues initially
  }, []);

  if (loading) return <p>Loading issues...</p>;

  return (
    <div className="dashboard admin-theme">
      <h1>All Issues</h1>

      {/* Filter buttons */}
      <div className="filters">
        <button onClick={() => fetchIssues()}>All</button>
        <button onClick={() => fetchIssues("pending")}>Pending</button>
        <button onClick={() => fetchIssues("inprogress")}>In Progress</button>
        <button onClick={() => fetchIssues("resolved")}>Resolved</button>
      </div>

      <table className="issue-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Description</th>
            <th>Status</th>
            <th>Reported By</th>
            <th>Assigned Volunteer</th>
            <th>Actions</th>
          </tr>
        </thead>
<tbody>
  {issues.length === 0 ? (
    <tr>
      <td colSpan="6">No issues found</td>
    </tr>
  ) : (
    issues.map((i) => (
      <tr key={i._id}>
        <td>{i.title}</td>
        <td>{i.description}</td>
        <td>{i.status}</td>
        {/* ✅ Correct field for reporter */}
        <td>{i.userId ? i.userId.username : "Unknown"}</td>
        {/* ✅ Correct field for volunteer */}
        <td>{i.assignedTo ? i.assignedTo.username : "Not assigned"}</td>
        <td>
          <button onClick={() => navigate(`/admin-dashboard/assign/${i._id}`)}>
            Assign
          </button>
        </td>
      </tr>
    ))
  )}
</tbody>

      </table>
    </div>
  );
}

export default AdminIssues;

