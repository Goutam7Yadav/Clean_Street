import React, { useState } from "react";
import axios from "axios";
import "./styles/Auth.css";


function Register() {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    phone: "",
    role: "user"
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/register", formData);
      alert(res.data); // show backend response
    } catch (err) {
      alert(err.response?.data || "Registration failed");
    }
  };

  return (
  <div className="Bodycontainer">
  <div className="auth-container">
    <h2>Register for CleanStreet</h2>
    <form onSubmit={handleSubmit}>
      <label>Full Name:</label>
      <input name="name" value={formData.name} onChange={handleChange} required />

      <label>Username:</label>
      <input name="username" value={formData.username} onChange={handleChange} required />

      <label>Email:</label>
      <input type="email" name="email" value={formData.email} onChange={handleChange} required />

      <label>Password:</label>
      <input type="password" name="password" value={formData.password} onChange={handleChange} required />

      <label>Phone Number (Optional):</label>
      <input type="tel" name="phone" value={formData.phone} onChange={handleChange} />

      <label>Role:</label>
      <select name="role" value={formData.role} onChange={handleChange} required>
        <option value="user">User</option>
        <option value="volunteer">Volunteer</option>
        <option value="admin">Admin</option>
      </select>

      <button type="submit">Register</button>
    </form>
    <p>Already have an account? <a href="/login">Login here</a></p>
  </div>
</div>
);
}

export default Register;
