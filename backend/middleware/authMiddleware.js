// backend/middleware/authMiddleware.js
const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
  // Get token from Authorization header
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // "Bearer <token>"

  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
    // Verify token using secret from .env (fallback to default)
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "defaultsecret");
    req.user = decoded; // attach user info (id, role, etc.) to request
    next(); // allow request to continue
  } catch (err) {
    return res.status(403).json({ error: "Invalid or expired token." });
  }
}

module.exports = authMiddleware;
