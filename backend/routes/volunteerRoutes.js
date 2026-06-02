/*const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const checkRole = require("../middleware/checkRole");
const Issue = require("../models/Issue");

// Mark issue as In Progress
router.put("/issues/:id/start", protect, checkRole("volunteer"), async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: "Issue not found" });

    issue.status = "In Progress";
    issue.assignedTo = req.user.id;
    await issue.save();

    res.json(issue);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Mark issue as Resolved
router.put("/issues/:id/resolve", protect, checkRole("volunteer"), async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: "Issue not found" });

    issue.status = "Resolved";
    issue.resolvedAt = Date.now();
    await issue.save();

    res.json(issue);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Reopen issue (set back to Pending)
router.put("/issues/:id/pending", protect, checkRole("volunteer"), async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: "Issue not found" });

    issue.status = "Pending";
    await issue.save();

    res.json(issue);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;*/
