import React from "react";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Filler
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend, Filler);

function UserRolesChart({ roles }) {
  const safeRoles = {
    Admin: roles?.Admin || 0,
    Volunteer: roles?.Volunteer || 0,
    User: roles?.User || 0,
  };

  const labels = ["Admin", "Volunteer", "User"];
  const values = [safeRoles.Admin, safeRoles.Volunteer, safeRoles.User];

  console.log("Roles prop (chart):", roles); // ✅ Debug log
  console.log("Values (chart):", values);

  const data = {
    labels,
    datasets: [
      {
        label: "User Roles",
        data: values,
        backgroundColor: ["#6366f1", "#22c55e", "#f59e0b"],
        borderColor: "#fff",
        borderWidth: 2
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "bottom" },
      tooltip: {
        callbacks: {
          label: (context) => `${context.label}: ${context.raw}`
        }
      }
    }
  };

  return (
    <div className="chart-card" style={{ height: "300px" }}>
      <h3>User Roles</h3>
      {values.every(v => v === 0) ? (
        <p>No role data available</p>
      ) : (
        <Pie data={data} options={options} />
      )}
    </div>
  );
}

export default UserRolesChart;
