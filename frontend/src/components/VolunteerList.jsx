import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getUsersByRole, assignIssue } from "../services/adminService";

function VolunteerList() {
  const { issueId } = useParams(); // get issueId from URL
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVolunteers = async () => {
      try {
        const res = await getUsersByRole("volunteer", token);
        setVolunteers(res.data);
      } catch (err) {
        console.error("❌ Error fetching volunteers:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchVolunteers();
  }, [token]);

 const handleAssign = async (volunteerId) => {
  try {
    await assignIssue(issueId, volunteerId, token);
    alert("✅ Issue assigned successfully!");
    navigate("/admin-dashboard/issues");
  } catch (err) {
    // Show backend error message clearly
    alert(err.response?.data?.error || "❌ Error assigning issue");
    console.error("❌ Error assigning issue:", err);
  }
};

  if (loading) return <p>Loading volunteers...</p>;

  return (
    <div className="dashboard admin-theme">
      <h1>Select Volunteer for Issue</h1>
      {volunteers.length === 0 ? (
        <p>No volunteers found</p>
      ) : (
        <table className="issue-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {volunteers.map((v) => (
              <tr key={v._id}>
                <td>{v.username}</td>
                <td>{v.email}</td>
                <td>
                  <button onClick={() => handleAssign(v._id)}>
                    Assign to this volunteer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default VolunteerList;
