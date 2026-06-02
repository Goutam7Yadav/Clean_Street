import React from "react";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

function ComplaintCategoriesChart({ categories }) {
  // categories should look like:
  // { Garbage: 5, Road: 3, StreetLight: 2, Park: 1 }

  const labels = Object.keys(categories || {});
  const values = Object.values(categories || {});

  const data = {
    labels,
    datasets: [
      {
        label: "Complaints",
        data: values,
        backgroundColor: [
          "#f87171", // red
          "#60a5fa", // blue
          "#fbbf24", // yellow
          "#34d399"  // green
        ],
        borderColor: "#fff",
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
      <h3>Complaint Categories</h3>
      <Pie data={data} options={options} />
    </div>
  );
}

export default ComplaintCategoriesChart;
