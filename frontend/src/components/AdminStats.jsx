import React, { useEffect, useState } from "react";
import IssueSummaryChart from "./charts/IssueSummaryChart";
import VolunteerStatsChart from "./charts/VolunteerStatsChart";
import ResolutionTimeChart from "./charts/ResolutionTimeChart";
import ComplaintCategoriesChart from "./charts/ComplaintCategoriesChart";
import UserRolesChart from "./charts/UserRolesChart";
import {
  getSummary,
  getVolunteerStats,
  getAvgResolutionTime,
  getComplaintCategories,
  getUserRoles,
} from "../services/issueService";
import "../styles/Dashboard.css";

function AdminStats() {
  const [summary, setSummary] = useState({});
  const [volunteerStats, setVolunteerStats] = useState([]);
  const [avgTime, setAvgTime] = useState(null);
  const [categoryStats, setCategoryStats] = useState({});
  const [userRolesStats, setUserRolesStats] = useState({});

  useEffect(() => {
    const token = localStorage.getItem("token");

    async function fetch() {
      try {
        // Issue summary
        const s = await getSummary(token);
        setSummary(s.data || {});

        // Volunteer stats
        const v = await getVolunteerStats(token);
        setVolunteerStats(v.data || []);

        // Average resolution time
        const a = await getAvgResolutionTime(token);
        setAvgTime(a.data || null);

        // Complaint categories (array → object)
        const c = await getComplaintCategories(token);
        let catObj = {};
        if (Array.isArray(c.data)) {
          catObj = Object.fromEntries(c.data.map(item => [item._id, item.count]));
        } else {
          catObj = c.data || {};
        }
        setCategoryStats(catObj);

        // User roles (backend returns object directly)
        const u = await getUserRoles(token);
        setUserRolesStats(u.data || { Admin: 0, Volunteer: 0, User: 0 });

        console.log("User Roles Stats (frontend):", u.data); // ✅ Debug log

      } catch (err) {
        console.error("Error loading admin stats:", err);
      }
    }

    fetch();
  }, []);

  return (
    <div className="dashboard admin-theme">
      <h1>Analytics</h1>
      <div className="activity grid-layout">
        <IssueSummaryChart summary={summary} />
        <VolunteerStatsChart stats={volunteerStats} />
        <ResolutionTimeChart resolutionStats={{ overallAvg: avgTime?.avgResolutionTimeHours, volunteers: [] }} />
        <ComplaintCategoriesChart categories={categoryStats} />
      </div>
    </div>
  );
}

export default AdminStats;
