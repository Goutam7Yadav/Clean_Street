import api from "./api";

export const getSummary = (token) =>
  api.get("/issues/summary", { headers: { Authorization: `Bearer ${token}` } });

export const getVolunteerStats = (token) =>
  api.get("/issues/volunteer-stats", { headers: { Authorization: `Bearer ${token}` } });

export const getAvgResolutionTime = (token) =>
  api.get("/issues/avg-resolution-time", { headers: { Authorization: `Bearer ${token}` } });

export const getVolunteerResolutionTime = (token) =>
  api.get("/issues/volunteer-resolution-time", { headers: { Authorization: `Bearer ${token}` } });

// ✅ New: Complaint categories
export const getComplaintCategories = (token) =>
  api.get("/issues/complaint-categories", { headers: { Authorization: `Bearer ${token}` } });

export const getAllIssues = (token) =>
  api.get("/issues", { headers: { Authorization: `Bearer ${token}` } });

export const getFilteredIssues = (status, token) =>
  api.get(`/issues/filter/${status}`, { headers: { Authorization: `Bearer ${token}` } });

export const assignIssueToVolunteer = (issueId, volunteerId, token) =>
  api.put(
    `/issues/${issueId}/assign`,
    { volunteerId },
    { headers: { Authorization: `Bearer ${token}` } }
  );

// ✅ New: User roles
export const getUserRoles = (token) =>
  api.get("/issues/user-roles", { headers: { Authorization: `Bearer ${token}` } });

export const getUserSummary = (token) =>
  api.get("/user/issues/summary", { headers: { Authorization: `Bearer ${token}` } });

export const getUserRecentIssues = (token) =>
  api.get("/user/issues/recent", { headers: { Authorization: `Bearer ${token}` } });
