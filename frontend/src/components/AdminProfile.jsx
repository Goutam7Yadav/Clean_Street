import React, { useEffect, useState } from "react";
import api from "../services/api";
import "../styles/Dashboard.css";

function AdminProfile() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", currentPassword: "", newPassword: "" });
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/issues/admin/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(res.data);
      setForm({
        name: res.data.name || "",
        email: res.data.email || "",
        phone: res.data.phone || "",
        currentPassword: "",
        newPassword: "",
      });
    } catch (err) {
      console.error("❌ Error loading admin profile:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.newPassword && !form.currentPassword) {
      alert("Please enter your current password to update a new password.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await api.put(
        "/issues/admin/profile",
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setProfile(res.data);
      setForm({ ...form, currentPassword: "", newPassword: "" });
      alert("Profile updated successfully.");
    } catch (err) {
      console.error("❌ Error updating admin profile:", err);
      alert(err.response?.data?.error || "Failed to update profile.");
    }
  };

  return (
    <div className="dashboard admin-theme">
      <h1>Admin Profile</h1>
      {loading ? (
        <p>Loading profile...</p>
      ) : profile ? (
        <div className="report-section">
          <h2>Account Details</h2>
          <form className="report-form" onSubmit={handleSubmit}>
            <label>Name</label>
            <input name="name" value={form.name} onChange={handleChange} required />

            <label>Email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} required />

            <label>Phone</label>
            <input type="tel" name="phone" value={form.phone} onChange={handleChange} />

            <label>Current Password</label>
            <input type="password" name="currentPassword" value={form.currentPassword} onChange={handleChange} />

            <label>New Password</label>
            <input type="password" name="newPassword" value={form.newPassword} onChange={handleChange} />

            <button type="submit">Save Changes</button>
          </form>
        </div>
      ) : (
        <p>Unable to load profile.</p>
      )}
    </div>
  );
}

export default AdminProfile;
