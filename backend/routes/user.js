// backend/routes/user.js
const express = require("express");
const Issue = require("../models/Issue");
const authMiddleware = require("../middleware/authMiddleware");
const multer = require("multer");
const path = require("path");

const router = express.Router();

// ✅ Configure multer for photo uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // save in backend/uploads folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // unique filename
  },
});
const upload = multer({ storage });

/**
 * POST /user/report
 * Allows a logged-in user to report a new issue with photo + location
 */
router.post("/report", authMiddleware, upload.single("photo"), async (req, res) => {
  try {
    const { title, description, priority, location, category, latitude, longitude } = req.body;

    const newIssue = new Issue({
      title,
      description,
      priority,
      location,
      category,
      latitude,
      longitude,
      photo: req.file ? req.file.filename : null, // save filename if photo uploaded
      status: "Pending",
      userId: req.user.id,   // comes from JWT payload
    });

    await newIssue.save();
    res.json({ message: "✅ Issue reported successfully!", issue: newIssue });
  } catch (err) {
    console.error("❌ Error reporting issue:", err);
    res.status(500).json({ error: "Failed to report issue" });
  }
});

/**
 * GET /user/issues
 * Fetch all issues reported by the logged-in user
 */
router.get("/issues", authMiddleware, async (req, res) => {
  try {
    const issues = await Issue.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(issues);
  } catch (err) {
    console.error("❌ Error fetching issues:", err);
    res.status(500).json({ error: "Failed to fetch issues" });
  }
});

module.exports = router;
