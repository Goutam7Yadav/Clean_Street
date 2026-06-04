const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const checkRole = require("../middleware/checkRole");
const User = require("../models/User");
const Issue = require("../models/Issue");
const issueRoutes = require("./issueRoutes");
const Notification = require("../models/Notification");

// Get users with optional role filter
router.get("/users", authMiddleware, checkRole("admin"), async (req, res) => {
  try {
    const { role } = req.query;
    let query = {};
    if (role) query.role = role;

    const users = await User.find(query).select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Update user role
router.put("/users/:id/role", authMiddleware, checkRole("admin"), async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.role = role;
    await user.save();
    res.json({ message: "Role updated successfully", user });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Delete user (prevent deleting admins)
router.delete("/users/:id", authMiddleware, checkRole("admin"), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.role === "admin") {
      return res.status(403).json({ error: "Cannot delete another admin" });
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Assign issue to volunteer (only once)
router.put("/issues/:id/assign", authMiddleware, checkRole("admin"), async (req, res) => {
  try {
    const { volunteerId } = req.body;

    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ error: "Issue not found" });

    // 🚫 Prevent re-assignment
    if (issue.assignedTo) {
      return res.status(400).json({ error: "This issue is already assigned to another volunteer." });
    }

    const volunteer = await User.findById(volunteerId);
    if (!volunteer) return res.status(404).json({ error: "Volunteer not found" });

    issue.assignedTo = volunteerId;
    issue.status = "In Progress";
    await issue.save();

    // ✅ Automatically create a notification
   await new Notification({
  message: `Issue "${issue.title}" assigned to ${volunteer.username || volunteer.name || volunteer.email}`
}).save();


    const populatedIssue = await Issue.findById(issue._id)
      .populate("userId", "username email")
      .populate("assignedTo", "username email");

    res.json({ message: "Issue assigned successfully", issue: populatedIssue });
  } catch (err) {
    console.error("❌ Error assigning issue:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Query-param filter wrapper for admin
router.get("/issues", authMiddleware, checkRole("admin"), async (req, res) => {
  try {
    const { status } = req.query;

    if (status) {
      const normalized = status.trim().toLowerCase();
      let mappedStatus;

      if (normalized === "pending") mappedStatus = "Pending";
      else if (normalized === "inprogress" || normalized === "in progress") mappedStatus = "In Progress";
      else if (normalized === "resolved") mappedStatus = "Resolved";

      if (!mappedStatus) {
        return res.status(400).json({ error: "Invalid status value" });
      }

      const issues = await Issue.find({ status: mappedStatus })
        .populate("userId", "username email")
        .populate("assignedTo", "username email");

      return res.json(issues);
    }

    // ✅ No status → return all issues
    const issues = await Issue.find()
      .populate("userId", "username email")
      .populate("assignedTo", "username email");

    res.json(issues);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Analytics
router.get("/analytics", authMiddleware, checkRole("admin"), async (req, res) => {
  try {
    const totalIssues = await Issue.countDocuments();
    const resolvedIssues = await Issue.countDocuments({ status: "Resolved" });
    const pendingIssues = await Issue.countDocuments({ status: "Pending" });

    res.json({ totalIssues, resolvedIssues, pendingIssues });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/complaint-categories", authMiddleware, checkRole("admin"), async (req, res) => {
  try {
    const categories = await Issue.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } }
    ]);
    res.json(categories); // ✅ returns an array
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/user-roles", authMiddleware, checkRole("admin"), async (req, res) => {
  try {
    const roles = await User.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } }
    ]);

    const roleObj = { Admin: 0, Volunteer: 0, User: 0 };
    roles.forEach(r => {
      const roleName = r._id.charAt(0).toUpperCase() + r._id.slice(1).toLowerCase();
      roleObj[roleName] = r.count;
    });

    res.json(roleObj);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Mount all issue routes under /issues (for advanced analytics, summary, etc.)
router.use("/issues", issueRoutes);

router.get("/notifications", authMiddleware, async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});


module.exports = router;
