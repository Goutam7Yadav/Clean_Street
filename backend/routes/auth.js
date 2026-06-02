/* forth formate code [4]*/
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require("../middleware/authMiddleware");
const checkRole = require("../middleware/checkRole");
const updateProfile = require("../utils/profileHelper");
const router = express.Router();

router.put("/profile", authMiddleware, updateProfile);
// ✅ Register
router.post("/register", async (req, res) => {
  const { name, username, email, password, phone, role } = req.body;
  // Normalize role to lowercase to match User schema enum (admin/volunteer/user)
  const normalizedRole = role ? role.toLowerCase() : "user";
  console.log("📩 Register request received:", { ...req.body, role: normalizedRole });

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      console.warn("⚠️ Registration failed: Username already in use");
      return res.status(400).send("Username already registered");
    }

    // Password will be hashed by the User model pre-save hook.
    const user = new User({ name, username, email, password, phone, role: normalizedRole });
    await user.save();

    console.log("✅ User registered:", user.username);
    res.send("User registered successfully");
  } catch (err) {
    console.error("❌ Error registering user:", err);
    try {
      res.status(500).json({ error: "Error registering user", message: err.message, stack: err.stack });
    } catch (sendErr) {
      console.error("❌ Failed to send JSON error response:", sendErr);
      res.status(500).send("Error registering user: " + (err.message || err));
    }
  }
});

// ✅ Login (using username)
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  console.log("🔑 Login attempt:", username);

  try {
    const user = await User.findOne({ username });
    if (!user) {
      console.warn("⚠️ Login failed: User not found");
      return res.status(400).send("User not found");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.warn("⚠️ Login failed: Invalid credentials for", username);
      return res.status(400).send("Invalid credentials");
    }

    // ✅ Generate JWT with role
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET, // use env variable in production
      { expiresIn: "1h" }
    );

    console.log("✅ Login successful:", user.username);
    res.json({
      message: `Welcome ${user.name}, role: ${user.role}`,
      token,
      role: user.role,
      userId: user._id // add userId to response
    });
  } catch (err) {
    console.error("❌ Error during login:", err);
    res.status(500).send("Error logging in");
  }
});

// ✅ Profile (protected)
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).send("User not found");
    res.json(user);
  } catch (err) {
    res.status(500).send("Error fetching profile");
  }
});

router.put("/profile", authMiddleware, async (req, res) => {
  const { name, email, phone, currentPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).send("User not found");

    if (currentPassword && newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) return res.status(400).send("Current password is incorrect");
      user.password = await bcrypt.hash(newPassword, 10);
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;

    await user.save();
    const updated = user.toObject();
    delete updated.password;
    res.json(updated);
  } catch (err) {
    console.error("❌ Error updating profile:", err);
    res.status(500).send("Error updating profile");
  }
});

// ✅ Role-based routes (return arrays for frontend .map())
router.get("/user-data", authMiddleware, checkRole("user"), (req, res) => {
  res.json([
    { description: "Pothole near main road" },
    { description: "Streetlight not working" }
  ]);
});

router.get("/volunteer-data", authMiddleware, checkRole("volunteer"), (req, res) => {
  res.json([
    { description: "Clean park area" },
    { description: "Fix streetlight issue" }
  ]);
});

router.get("/admin-data", authMiddleware, checkRole("admin"), (req, res) => {
  res.json([
    { description: "User list overview" },
    { description: "Reported issues summary" }
  ]);
});

module.exports = router;
