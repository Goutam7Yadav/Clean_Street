import React from "react";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

function IssueSummaryChart({ summary }) {
  const data = {
    labels: ["Pending", "In Progress", "Resolved"],
    datasets: [
      {
        label: "Issues",
        data: [
          summary.pendingIssues || 0,
          summary.inProgressIssues || 0,
          summary.resolvedIssues || 0
        ],
        backgroundColor: ["#f87171", "#fbbf24", "#34d399"], // red, yellow, green
        borderColor: ["#fff", "#fff", "#fff"],
        borderWidth: 2
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom"
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.label}: ${context.raw}`
        }
      }
    }
  };

  return (
    <div className="chart-card">
      <h3>Issue Summary</h3>
      <Pie data={data} options={options} />
    </div>
  );
}

export default IssueSummaryChart;
