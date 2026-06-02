import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function VolunteerStatsChart({ stats }) {
  // stats should be an array like:
  // [{ volunteerName: "Rahul", resolvedCount: 5 }, { volunteerName: "Priya", resolvedCount: 3 }]

  const data = {
    labels: stats.map((v) => v.volunteerName),
    datasets: [
      {
        label: "Resolved Issues",
        data: stats.map((v) => v.resolvedCount),
        backgroundColor: "#3b82f6", // blue
        borderRadius: 4
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: "Volunteer Resolved Issues"
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  return (
    <div className="chart-card">
      <h3>Volunteer Stats</h3>
      <Bar data={data} options={options} />
    </div>
  );
}

export default VolunteerStatsChart;
