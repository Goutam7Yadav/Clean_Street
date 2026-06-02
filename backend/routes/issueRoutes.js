//issueRoutes.js
const express = require("express");
const router = express.Router();
const Issue = require("../models/Issue");
const authMiddleware = require("../middleware/authMiddleware");
const multer = require("multer");
const path = require("path");
const User = require("../models/User");
const { protect } = require("../middleware/authMiddleware");
const checkRole = require("../middleware/checkRole");
const updateProfile = require("../utils/profileHelper");
const Notification = require("../models/Notification");

// Debug log to confirm this file is loaded
console.log("Issue routes loaded");
// 🆕 Multer storage config for photo uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // folder to store images
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Storage setup for completion photos
const completionStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/completion");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const completionUpload = multer({ storage: completionStorage });

// ✅ User creates a new issue with location + coordinates + photo
router.post("/", authMiddleware, upload.single("photo"), async (req, res) => {
  try {
    if (req.user.role !== "user") {
      return res.status(403).json({ error: "Only users can create issues" });
    }

    const { title, description, location, latitude, longitude, category, priority } = req.body;

    const newIssue = new Issue({
      title,
      description,
      location,
      latitude: Number(latitude),
      longitude: Number(longitude),
      category,
      priority,
      photo: req.file ? req.file.filename : null,
      userId: req.user.id   // creator
    });

    await newIssue.save();

    // ✅ Automatically create a notification
    await new Notification({
      message: `New issue reported: ${newIssue.title}`
    }).save();

    res.status(201).json(newIssue);
  } catch (err) {
    console.error("❌ Error creating issue:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Role-based issue viewing
router.get("/", authMiddleware, async (req, res) => {
  try {
    let issues;

    if (req.user.role === "admin") {
      // Admin sees all issues
      issues = await Issue.find()
        .populate("userId", "username email")
        .populate("assignedTo", "username email");
    } else if (req.user.role === "volunteer") {
      // Volunteer sees only issues assigned to them
      issues = await Issue.find({ assignedTo: req.user.id })
        .populate("userId", "username email");
    } else {
      // User sees only their own issues
      issues = await Issue.find({ userId: req.user.id });
    }

    res.json(issues);
  } catch (err) {
    console.error("❌ Error fetching issues:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Admin assigns an issue to a volunteer
router.put("/:id/assign", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Only admins can assign issues" });
    }

    const { volunteerId } = req.body;

    const issue = await Issue.findByIdAndUpdate(
      req.params.id,
      { assignedTo: volunteerId, status: "In Progress" },
      { new: true }
    )
      .populate("userId", "username email")
      .populate("assignedTo", "username email");

    if (!issue) {
      return res.status(404).json({ error: "Issue not found" });
    }

    res.json(issue);
  } catch (err) {
    console.error("❌ Error assigning issue:", err);
    res.status(500).json({ error: err.message });
  }
});

// // ✅ Volunteer resolves issue with optional completion photo
// router.put("/:id/resolve", authMiddleware, completionUpload.single("completionPhoto"), async (req, res) => {
//   try {
//     if (req.user.role !== "volunteer") {
//       return res.status(403).json({ error: "Only volunteers can resolve issues" });
//     }

//     const issue = await Issue.findById(req.params.id);
//     if (!issue) return res.status(404).json({ error: "Issue not found" });

//     if (issue.assignedTo.toString() !== req.user.id) {
//       return res.status(403).json({ error: "You can only resolve issues assigned to you" });
//     }

//     issue.status = "Resolved";

//     // Save completion photo if uploaded
//     if (req.file) {
//       issue.completionPhoto = req.file.filename;
//     }
    
//     issue.resolvedAt = new Date();   // ✅ record resolution time

//     await issue.save();
//     res.json(issue);
//   } catch (err) {
//     console.error("❌ Error resolving issue:", err);
//     res.status(500).json({ error: err.message });
//   }
// });

// ✅ Volunteer resolves issue with optional completion photo
router.put("/:id/resolve", authMiddleware, completionUpload.single("completionPhoto"), async (req, res) => {
  try {
    if (req.user.role !== "volunteer") {
      return res.status(403).json({ error: "Only volunteers can resolve issues" });
    }

    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ error: "Issue not found" });

    if (issue.assignedTo.toString() !== req.user.id) {
      return res.status(403).json({ error: "You can only resolve issues assigned to you" });
    }

    const updateData = {
      status: "Resolved",
      resolvedAt: new Date()
    };

    if (req.file) {
      updateData.completionPhoto = req.file.filename;
    }

    const updatedIssue = await Issue.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: false } // ✅ skip full validation
    );

     if (!updatedIssue) return res.status(404).json({ error: "Issue not found after update" });

    // ✅ Automatically create a notification
    await new Notification({
      message: `Issue "${updatedIssue.title}" status changed to Resolved`
    }).save();

    res.json(updatedIssue);
  } catch (err) {
    console.error("❌ Error resolving issue:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Admin filters issues by status
router.get("/filter/:status", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Only admins can filter issues" });
    }

    const { status } = req.params;

    // Validate status
    const validStatuses = ["Pending", "In Progress", "Resolved"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    const issues = await Issue.find({ status })
      .populate("user", "username")
      .populate("assignedTo", "username");

    res.json(issues);
  } catch (err) {
    console.error("❌ Error filtering issues:", err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/summary", authMiddleware, checkRole("admin"), async (req, res) => {
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


// // ✅ Admin summary of issues by status
// router.get("/summary", authMiddleware, async (req, res) => {
//   try {
//     if (req.user.role !== "admin") {
//       return res.status(403).json({ error: "Only admins can view summary" });
//     }

//     const summary = await Issue.aggregate([
//       {
//         $group: {
//           _id: "$status",
//           count: { $sum: 1 }
//         }
//       }
//     ]);

//     // Convert array into object { Pending: X, In Progress: Y, Resolved: Z }
//     const result = {};
//     summary.forEach(item => {
//       result[item._id] = item.count;
//     });

//     res.json(result);
//   } catch (err) {
//     console.error("❌ Error generating summary:", err);
//     res.status(500).json({ error: err.message });
//   }
// });

// ✅ Admin view: issues resolved per volunteer
router.get("/volunteer-stats", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Only admins can view volunteer stats" });
    }

    const stats = await Issue.aggregate([
      { $match: { status: "Resolved", assignedTo: { $ne: null } } },
      {
        $group: {
          _id: "$assignedTo",
          resolvedCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "volunteer"
        }
      },
      {
        $unwind: "$volunteer"
      },
      {
        $project: {
          _id: 0,
          volunteerId: "$volunteer._id",
          volunteerName: "$volunteer.username",
          resolvedCount: 1
        }
      }
    ]);

    res.json(stats);
  } catch (err) {
    console.error("❌ Error generating volunteer stats:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Admin view: average resolution time
router.get("/avg-resolution-time", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Only admins can view resolution time" });
    }
    const stats = await Issue.aggregate([
      { $match: { status: "Resolved", resolvedAt: { $ne: null } } },
      {
        $project: {
          resolutionTime: { $subtract: ["$resolvedAt", "$createdAt"] }
        }
      },
      {
        $group: {
          _id: null,
          avgResolutionTime: { $avg: "$resolutionTime" }
        }
      }
    ]);

    if (stats.length === 0) {
      return res.json({ avgResolutionTime: "No resolved issues yet" });
    }

    // Convert ms → hours
    const avgHours = (stats[0].avgResolutionTime / (1000 * 60 * 60)).toFixed(2);

    res.json({ avgResolutionTimeHours: avgHours });
  } catch (err) {
    console.error("❌ Error calculating avg resolution time:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Admin view: average resolution time per volunteer
router.get("/volunteer-resolution-time", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Only admins can view resolution times" });
    }

    const stats = await Issue.aggregate([
      { $match: { status: "Resolved", resolvedAt: { $ne: null }, assignedTo: { $ne: null } } },
      {
        $project: {
          assignedTo: 1,
          resolutionTime: { $subtract: ["$resolvedAt", "$createdAt"] }
        }
      },
      {
        $group: {
          _id: "$assignedTo",
          avgResolutionTime: { $avg: "$resolutionTime" }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "volunteer"
        }
      },
      { $unwind: "$volunteer" },
      {
        $project: {
          _id: 0,
          volunteerId: "$volunteer._id",
          volunteerName: "$volunteer.username",
          avgResolutionTimeHours: {
            $round: [{ $divide: ["$avgResolutionTime", 1000 * 60 * 60] }, 2]
          }
        }
      }
    ]);

    if (stats.length === 0) {
      return res.json({ message: "No resolved issues yet" });
    }

    res.json(stats);
  } catch (err) {
    console.error("❌ Error calculating volunteer resolution times:", err);
    res.status(500).json({ error: err.message });
  }
});

// Complaint Categories
router.get("/complaint-categories", async (req, res) => {
  try {
    const categories = await Issue.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } }
    ]);

    const result = {};
    categories.forEach(c => {
      result[c._id] = c.count;
    });

    res.json(result);
  } catch (err) {
    console.error("Error fetching complaint categories:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// routes/issues.js
router.get("/complaint-categories", async (req, res) => {
  try {
    const categories = await Issue.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } }
    ]);

    const result = {};
    categories.forEach(c => {
      result[c._id] = c.count;
    });

    res.json(result);
  } catch (err) {
    console.error("Error fetching complaint categories:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// routes/issues.js
router.get("/user-roles", async (req, res) => {
  try {
    const adminCount = await User.countDocuments({ role: "Admin" });
    const volunteerCount = await User.countDocuments({ role: "Volunteer" });
    const userCount = await User.countDocuments({ role: "User" });

    res.json({ Admin: adminCount, Volunteer: volunteerCount, User: userCount });
  } catch (err) {
    console.error("Error fetching user roles:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /issues/recent → all issues for dashboard feed
router.get("/recent", authMiddleware, async (req, res) => {
  try {
    const issues = await Issue.find()
      .sort({ createdAt: -1 }) // newest first
      .limit(10)               // show latest 10
      .populate("userId", "username email")
      .populate("assignedTo", "username email");

    res.json(issues);
  } catch (err) {
    console.error("❌ Error fetching recent issues:", err);
    res.status(500).json({ error: err.message });
  }
});

// Volunteer reopens issue (Pending)
router.put("/:id/pending", authMiddleware, checkRole("volunteer"), async (req, res) => {
  try {
    const updatedIssue = await Issue.findByIdAndUpdate(
      req.params.id,
      { $set: { status: "Pending" } },
      { new: true, runValidators: false }
    );

    if (!updatedIssue) return res.status(404).json({ message: "Issue not found" });

    // ✅ Notification: status changed to Pending
    await new Notification({
      message: `Issue "${updatedIssue.title}" status changed to Pending`
    }).save();

    res.json(updatedIssue);
  } catch (err) {
    console.error("Error in pending route:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Volunteer starts issue (In Progress)
router.put("/:id/start", authMiddleware, checkRole("volunteer"), async (req, res) => {
  try {
    console.log("Start route hit:", req.params.id);
    const updatedIssue = await Issue.findByIdAndUpdate(
      req.params.id,
      { $set: { status: "In Progress", startedAt: new Date() } },
      { new: true, runValidators: false }
    );

    if (!updatedIssue) return res.status(404).json({ message: "Issue not found" });

    // ✅ Notification: status changed to In Progress
    await new Notification({
      message: `Issue "${updatedIssue.title}" status changed to In Progress`
    }).save();

    res.json(updatedIssue);
  } catch (err) {
    console.error("Error in start route:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Volunteer profile - view details
router.get("/volunteer/profile", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "volunteer") {
      return res.status(403).json({ error: "Only volunteers can view this profile" });
    }

    const volunteer = await User.findById(req.user.id).select("-password");
    res.json(volunteer);
  } catch (err) {
    console.error("❌ Error fetching volunteer profile:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Volunteer profile - update details
router.put("/volunteer/profile", authMiddleware, updateProfile);

// ✅ Admin profile - view details
router.get("/admin/profile", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Only admins can view this profile" });
    }

    const admin = await User.findById(req.user.id).select("-password");
    res.json(admin);
  } catch (err) {
    console.error("❌ Error fetching admin profile:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Admin profile - update details
router.put("/admin/profile", authMiddleware, updateProfile);

// Complaint categories breakdown
router.get("/complaint-categories", authMiddleware, checkRole("admin"), async (req, res) => {
  try {
    const categories = await Issue.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } }
    ]);
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// User roles breakdown
router.get("/user-roles", authMiddleware, checkRole("admin"), async (req, res) => {
  try {
    const roles = await User.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } }
    ]);
    res.json(roles);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Submit feedback for an issue
router.post("/issues/:id/feedback", authMiddleware, async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ error: "Issue not found" });

    // Save feedback (could be rating + comment)
    issue.feedback = {
      rating: req.body.rating,
      comment: req.body.comment,
      userId: req.user.id
    };
    await issue.save();

    // ✅ Automatically create a notification
    await new Notification({
      message: `Feedback submitted for issue "${issue.title}"`
    }).save();

    res.json({ message: "Feedback submitted successfully", issue });
  } catch (err) {
    console.error("❌ Error submitting feedback:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Fetch all notifications
router.get("/notifications", authMiddleware, async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
