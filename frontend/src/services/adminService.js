import axios from "axios";

// ✅ Adjust this to match your backend port
const API_URL = "http://localhost:5000/api/admin";

export const getUsers = (token) =>
  axios.get(`${API_URL}/users`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const getUsersByRole = (role, token) =>
  axios.get(`${API_URL}/users?role=${role}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const updateUserRole = (id, role, token) =>
  axios.put(
    `${API_URL}/users/${id}/role`,
    { role },
    { headers: { Authorization: `Bearer ${token}` } }
  );

export const deleteUser = (id, token) =>
  axios.delete(`${API_URL}/users/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const assignIssue = (issueId, volunteerId, token) =>
  axios.put(
    `${API_URL}/issues/${issueId}/assign`,
    { volunteerId },
    { headers: { Authorization: `Bearer ${token}` } }
  );


export const getStats = (token) =>
  axios.get(`${API_URL}/analytics`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  export const getIssues = (token) =>
  axios.get(`${API_URL}/issues`, {
    headers: { Authorization: `Bearer ${token}` }
  });

export const getIssuesByStatus = (status, token) =>
  axios.get(`${API_URL}/issues?status=${status}`, {
    headers: { Authorization: `Bearer ${token}` }
  });



// import axios from "axios";

// export const getUsers = (token) =>
//   axios.get("/api/admin/users", { headers: { Authorization: `Bearer ${token}` } });

// export const updateUserRole = (id, role, token) =>
//   axios.put(`/api/admin/users/${id}/role`, { role }, { headers: { Authorization: `Bearer ${token}` } });

// export const deleteUser = (id, token) =>
//   axios.delete(`/api/admin/users/${id}`, { headers: { Authorization: `Bearer ${token}` } });

// export const assignIssue = (issueId, volunteerId, token) =>
//   axios.put(`/api/admin/assign/${issueId}`, { volunteerId }, { headers: { Authorization: `Bearer ${token}` } });

// export const getStats = (token) =>
//   axios.get("/api/admin/analytics", { headers: { Authorization: `Bearer ${token}` } });

// export const getUsersByRole = (role, token) =>
//   axios.get(`/api/admin/users?role=${role}`, {
//     headers: { Authorization: `Bearer ${token}` }
//   });
