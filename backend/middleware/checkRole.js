// middleware/checkRole.js
function checkRole(requiredRole) {
  return (req, res, next) => {
    const userRole = req.user.role; // decoded from JWT in authMiddleware
    if (userRole !== requiredRole) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
}

module.exports = checkRole;
