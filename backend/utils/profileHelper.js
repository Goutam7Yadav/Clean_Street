const User = require("../models/User");

/**
 * Shared profile update function
 * Works for user, volunteer, and admin roles
 */
async function updateProfile(req, res) {
  try {
    const { name, email, phone, currentPassword, newPassword } = req.body;

    // Find logged-in user
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Update basic info
    user.name = name || user.name;
    user.email = email || user.email;
    user.phone = phone || user.phone;

    // Handle password change
    if (newPassword) {
      const isMatch = await user.matchPassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({ error: "Invalid current password" });
      }
      user.password = newPassword; // triggers pre-save hook
    }

    await user.save();
    res.json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (err) {
    console.error("❌ Error updating profile:", err);
    res.status(500).json({ error: "Server error" });
  }
}

module.exports = updateProfile;
