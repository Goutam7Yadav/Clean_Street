const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");

// Create notification
router.post("/", async (req, res) => {
  try {
    const notification = new Notification({ message: req.body.message });
    await notification.save();
    res.json(notification);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all notifications
router.get("/", async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
