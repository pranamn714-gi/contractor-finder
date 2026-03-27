const jwt = require("jsonwebtoken");

// ─────────────────────────────────────────────────────────────
// middleware/auth.js
// General auth middleware for user / contractor routes
// ─────────────────────────────────────────────────────────────

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role }
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

module.exports = authMiddleware;const express = require("express");
const User = require("../models/User");
const Contractor = require("../models/Contractor");
const Admin = require("../models/Admin");

const router = express.Router();

// ─────────────────────────────────────────────────────────────
// POST /api/auth/signup
// Body: { name, email, password, role }
// role must be "user" or "contractor"
// Account is set to status:"pending" until admin approves
// ─────────────────────────────────────────────────────────────
router.post("/signup", async (req, res) => {
  try {
    const { role, name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }

    if (!role || !["user", "contractor"].includes(role)) {
      return res.status(400).json({ message: "Role must be 'user' or 'contractor'" });
    }

    const Model = role === "contractor" ? Contractor : User;

    const existing = await Model.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const account = new Model({ name, email, password, role, status: "pending" });
    await account.save();

    res.status(201).json({
      message: `Registered successfully! Your ${role} account is pending admin approval. You will be able to log in once approved.`,
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// POST /api/auth/login
//
// Admin  → { email, password }               (no role field)
// User   → { email, password, role: "user" }
// Contr. → { email, password, role: "contractor" }
//
// Users/contractors with status "pending" are blocked.
// ─────────────────────────────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    let { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    email = email.toLowerCase().trim();

    // ── Admin login ──────────────────────────────────────────
    // If no role is provided OR role is explicitly "admin"
    if (!role || role === "admin") {
      const admin = await Admin.findOne({ email });

      if (admin) {
        const isMatch = await admin.matchPassword(password);
        if (!isMatch) {
          return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
          { id: admin._id, role: "admin" },
          process.env.JWT_SECRET,
          { expiresIn: "1d" }
        );

        return res.json({
          token,
          role: "admin",
          user: { id: admin._id, name: admin.name, email: admin.email },
        });
      }

      // Role was explicitly "admin" but no admin found → error
      if (role === "admin") {
        return res.status(401).json({ message: "Invalid admin credentials" });
      }
      // No role provided and not an admin → fall through to user check
    }

    // ── User / Contractor login ──────────────────────────────
    const resolvedRole = role || "user";
    if (!["user", "contractor"].includes(resolvedRole)) {
      return res.status(400).json({ message: "Invalid role. Must be 'user' or 'contractor'" });
    }

    const Model = resolvedRole === "contractor" ? Contractor : User;
    const account = await Model.findOne({ email });

    if (!account) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await account.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // ── Block pending accounts ───────────────────────────────
    if (account.status === "pending") {
      return res.status(403).json({
        message: "Your account is pending admin approval. You will receive access once an admin approves your registration.",
        status: "pending",
      });
    }

    const token = jwt.sign(
      { id: account._id, role: resolvedRole },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.json({
      token,
      role: resolvedRole,
      user: { id: account._id, name: account.name, email: account.email },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;