// backend/server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config(); // ✅ load environment variables

const app = express();
app.use(express.urlencoded({ extended: true })); // handle form data
app.use(express.json());
app.use(cors());
app.use("/uploads", express.static("uploads"));

// Routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/userRoutes");   // ✅ add user routes
const issueRoutes = require("./routes/issueRoutes"); // ✅ add issue routes
//const volunteerRoutes = require("./routes/volunteerRoutes");
const adminRoutes = require("./routes/adminRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

//app.use("/", authRoutes);
//app.use("/user", userRoutes);                  // ✅ mount user routes
//app.use("/issues", issueRoutes);               // ✅ mount issue routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);                  // ✅ mount user routes
//app.use("/api/register", authRoutes);
app.use("/api/issues", issueRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationRoutes);
// Connect to MongoDB (local or from .env)
mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost:27017/cleanstreet")
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
