import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function ResolutionTimeChart({ resolutionStats }) {
  // resolutionStats should look like:
  // {
  //   overallAvg: 5.2,
  //   volunteers: [
  //     { name: "Rahul", avgTime: 4.8 },
  //     { name: "Priya", avgTime: 6.1 }
  //   ]
  // }

const labels = Array.isArray(resolutionStats.volunteers)
  ? resolutionStats.volunteers.map((v) => v.name)
  : [];

const data = {
  labels,
  datasets: [
    {
      label: "Avg Resolution Time (hrs)",
      data: Array.isArray(resolutionStats.volunteers)
        ? resolutionStats.volunteers.map((v) => v.avgTime)
        : [],
      borderColor: "#10b981", // green
      backgroundColor: "#6ee7b7",
      tension: 0.3,
      fill: true
    }
  ]
};


  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: `Resolution Time (Overall Avg: ${resolutionStats.overallAvg || 0} hrs)`
      },
      legend: {
        position: "bottom"
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Hours"
        }
      }
    }
  };

  return (
    <div className="chart-card">
      <h3>Resolution Time</h3>
      <Line data={data} options={options} />
    </div>
  );
}

export default ResolutionTimeChart;
