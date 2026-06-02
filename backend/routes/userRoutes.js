// backend/routes/userRoutes.js
const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const Issue = require("../models/Issue");

const router = express.Router();

// Overall issue summary (for all users)
router.get("/issues/summary", authMiddleware, async (req, res) => {
  try {
    const totalIssues = await Issue.countDocuments();
    const resolvedIssues = await Issue.countDocuments({ status: "Resolved" });
    const pendingIssues = await Issue.countDocuments({ status: "Pending" });
    const inProgressIssues = await Issue.countDocuments({ status: "In Progress" });

    res.json({ totalIssues, resolvedIssues, pendingIssues, inProgressIssues });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
