const mongoose = require("mongoose");

const issueSchema = new mongoose.Schema({
  // Basic details
  title: { type: String, required: true },
  description: { type: String, required: true },

  // Location details
  location: { type: String, required: true },   // human-readable location name
  latitude: { type: Number, required: true },   // GPS latitude
  longitude: { type: Number, required: true },  // GPS longitude

  // Photos
  photo: { type: String },                          // filename of uploaded issue photo
  completionPhoto: { type: String, default: null }, // volunteer’s completion photo

  // Category
  category: {
    type: String,
    enum: [
      "Garbage",
      "Road",
      "StreetLight",
      "Water",
      "Sewage",
      "Park",
      "Tree",
      "Parking",
      "Building",
      "Other"
    ],
    required: true
  },

  // Priority
  priority: {
    type: String,
    enum: ["Low", "Medium", "High"],
    default: "Medium"
  },

  // Status tracking
  status: { 
    type: String, 
    enum: ["Pending", "In Progress", "Resolved"], 
    default: "Pending" 
  },
  createdAt: { type: Date, default: Date.now },
  resolvedAt: { type: Date, default: null },

  // Relationships
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // reporter
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null } // volunteer
});

module.exports = mongoose.model("Issue", issueSchema);
