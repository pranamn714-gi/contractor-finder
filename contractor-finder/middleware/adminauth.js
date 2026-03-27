const jwt = require("jsonwebtoken");

// ─────────────────────────────────────────────────────────────
// middleware/adminAuth.js
//
// Two middleware functions:
//   1. verifyToken  – validates JWT and attaches req.user
//   2. requireAdmin – ensures the logged-in user is an admin
//
// Usage:
//   const { verifyToken, requireAdmin } = require("../middleware/adminAuth");
//   router.get("/some-route", verifyToken, requireAdmin, handler);
// ─────────────────────────────────────────────────────────────

function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided. Please log in." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role }
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token. Please log in again." });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden: Admin access only." });
  }
  next();
}

module.exports = { verifyToken, requireAdmin };