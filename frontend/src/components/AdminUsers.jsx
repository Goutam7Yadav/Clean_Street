import React, { useEffect, useState } from "react";
import { getUsers, getUsersByRole, deleteUser, updateUserRole } from "../services/adminService";
import "../styles/Dashboard.css";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  const fetchUsers = async (role) => {
    try {
      setLoading(true);
      let res;
      if (role) {
        res = await getUsersByRole(role, token);
      } else {
        res = await getUsers(token);
      }
      setUsers(Array.isArray(res.data) ? res.data : res.data.users || []);
    } catch (err) {
      console.error("❌ Error fetching users:", err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(); // load all users initially
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await deleteUser(id, token);
      alert("✅ User deleted successfully!");
      fetchUsers();
    } catch (err) {
      console.error("❌ Error deleting user:", err);
    }
  };

  const handlePromote = async (id) => {
    try {
      await updateUserRole(id, "volunteer", token);
      alert("✅ User promoted to volunteer!");
      fetchUsers();
    } catch (err) {
      console.error("❌ Error updating role:", err);
    }
  };

  if (loading) return <p>Loading users...</p>;

  return (
    <div className="dashboard admin-theme">
      <h1>Manage Users</h1>

      {/* Filter buttons */}
      <div className="filters">
        <button onClick={() => fetchUsers()}>All</button>
        <button onClick={() => fetchUsers("user")}>Users</button>
        <button onClick={() => fetchUsers("volunteer")}>Volunteers</button>
        <button onClick={() => fetchUsers("admin")}>Admins</button>
      </div>

      <table className="user-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Username</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan="5">No users found</td>
            </tr>
          ) : (
            users.map((u) => (
              <tr key={u._id}>
                <td>{u.name}</td>
                <td>{u.username}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>
                  {u.role !== "admin" && (
                    <>
                      <button onClick={() => handleDelete(u._id)}>Delete</button>
                      {u.role === "user" && (
                        <button onClick={() => handlePromote(u._id)}>Make Volunteer</button>
                      )}
                    </>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default AdminUsers;
