const express = require("express");
const jwt     = require("jsonwebtoken");
const Admin      = require("../models/Admin");
const User       = require("../models/User");
const Contractor = require("../models/Contractor");
const Booking    = require("../models/Booking");
const Rating     = require("../models/Rating");

const { verifyToken, requireAdmin } = require("../middleware/adminAuth");

const router   = express.Router();
const adminOnly = [verifyToken, requireAdmin];

// ═══════════════════════════════════════════════════════
// AUTH
// ═══════════════════════════════════════════════════════

// POST /api/admin/login
router.post("/login", async (req, res) => {
  try {
    let { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email and password are required" });

    email = email.toLowerCase().trim();
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(401).json({ message: "Invalid admin credentials" });

    const isMatch = await admin.matchPassword(password);
    if (!isMatch) return res.status(401).json({ message: "Invalid admin credentials" });

    const token = jwt.sign(
      { id: admin._id, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Admin login successful",
      token,
      role: "admin",
      admin: { id: admin._id, name: admin.name, email: admin.email },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════
// STATS  –  GET /api/admin/stats
// ═══════════════════════════════════════════════════════
router.get("/stats", ...adminOnly, async (req, res) => {
  try {
    const [
      totalUsers, totalContractors,
      pendingUsers, pendingContractors,
      approvedUsers, approvedContractors,
      totalBookings, totalRatings,
    ] = await Promise.all([
      User.countDocuments(),
      Contractor.countDocuments(),
      User.countDocuments({ status: "pending" }),
      Contractor.countDocuments({ status: "pending" }),
      User.countDocuments({ status: "approved" }),
      Contractor.countDocuments({ status: "approved" }),
      Booking.countDocuments(),
      Rating.countDocuments(),
    ]);

    res.json({
      users:        { total: totalUsers,       pending: pendingUsers,       approved: approvedUsers       },
      contractors:  { total: totalContractors, pending: pendingContractors, approved: approvedContractors },
      totalPending:  pendingUsers  + pendingContractors,
      totalApproved: approvedUsers + approvedContractors,
      totalBookings,
      totalRatings,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════
// USERS  –  GET /api/admin/users
// ═══════════════════════════════════════════════════════
router.get("/users", ...adminOnly, async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/admin/users/:id
router.delete("/users/:id", ...adminOnly, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: `User "${user.name}" deleted successfully` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════
// CONTRACTORS  –  GET /api/admin/contractors
// ═══════════════════════════════════════════════════════
router.get("/contractors", ...adminOnly, async (req, res) => {
  try {
    const contractors = await Contractor.find()
      .select("-password")
      .sort({ createdAt: -1 });
    res.json(contractors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/admin/contractors/:id
router.delete("/contractors/:id", ...adminOnly, async (req, res) => {
  try {
    const contractor = await Contractor.findByIdAndDelete(req.params.id);
    if (!contractor) return res.status(404).json({ message: "Contractor not found" });
    res.json({ message: `Contractor "${contractor.name}" deleted successfully` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════
// BOOKINGS  –  GET /api/admin/bookings
// ═══════════════════════════════════════════════════════
router.get("/bookings", ...adminOnly, async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("user",       "name email")
      .populate("contractor", "name email")
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/admin/bookings/:id
router.delete("/bookings/:id", ...adminOnly, async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    res.json({ message: "Booking deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════
// RATINGS  –  GET /api/admin/ratings
// ═══════════════════════════════════════════════════════
router.get("/ratings", ...adminOnly, async (req, res) => {
  try {
    const ratings = await Rating.find()
      .populate("user",       "name email")
      .populate("contractor", "name email")
      .sort({ createdAt: -1 });
    res.json(ratings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/admin/ratings/:id
router.delete("/ratings/:id", ...adminOnly, async (req, res) => {
  try {
    const rating = await Rating.findByIdAndDelete(req.params.id);
    if (!rating) return res.status(404).json({ message: "Rating not found" });
    res.json({ message: "Rating deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════
// PENDING / APPROVED (kept from original)
// ═══════════════════════════════════════════════════════

router.get("/pending", ...adminOnly, async (req, res) => {
  try {
    const [pendingUsers, pendingContractors] = await Promise.all([
      User.find({ status: "pending" }).select("-password").sort({ createdAt: -1 }),
      Contractor.find({ status: "pending" }).select("-password").sort({ createdAt: -1 }),
    ]);
    res.json({
      totalPending: pendingUsers.length + pendingContractors.length,
      users: pendingUsers,
      contractors: pendingContractors,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/approved", ...adminOnly, async (req, res) => {
  try {
    const [approvedUsers, approvedContractors] = await Promise.all([
      User.find({ status: "approved" }).select("-password").sort({ updatedAt: -1 }),
      Contractor.find({ status: "approved" }).select("-password").sort({ updatedAt: -1 }),
    ]);
    res.json({
      totalApproved: approvedUsers.length + approvedContractors.length,
      users: approvedUsers,
      contractors: approvedContractors,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/all", ...adminOnly, async (req, res) => {
  try {
    const [users, contractors] = await Promise.all([
      User.find().select("-password").sort({ createdAt: -1 }),
      Contractor.find().select("-password").sort({ createdAt: -1 }),
    ]);
    res.json({ users, contractors });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Approve user
router.put("/approve/user/:id", ...adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.status === "approved")
      return res.status(400).json({ message: "User is already approved" });
    user.status = "approved";
    await user.save();
    res.json({ message: `${user.name} approved. They can now log in.`, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Approve contractor
router.put("/approve/contractor/:id", ...adminOnly, async (req, res) => {
  try {
    const contractor = await Contractor.findById(req.params.id).select("-password");
    if (!contractor) return res.status(404).json({ message: "Contractor not found" });
    if (contractor.status === "approved")
      return res.status(400).json({ message: "Contractor is already approved" });
    contractor.status = "approved";
    await contractor.save();
    res.json({ message: `${contractor.name} approved. They can now log in.`, contractor });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reject user
router.put("/reject/user/:id", ...adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    user.status = "pending";
    await user.save();
    res.json({ message: `${user.name} rejected / reset to pending.`, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reject contractor
router.put("/reject/contractor/:id", ...adminOnly, async (req, res) => {
  try {
    const contractor = await Contractor.findById(req.params.id).select("-password");
    if (!contractor) return res.status(404).json({ message: "Contractor not found" });
    contractor.status = "pending";
    await contractor.save();
    res.json({ message: `${contractor.name} rejected / reset to pending.`, contractor });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Legacy delete routes (keep for backwards compatibility)
router.delete("/user/:id", ...adminOnly, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: `User "${user.name}" deleted successfully` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/contractor/:id", ...adminOnly, async (req, res) => {
  try {
    const contractor = await Contractor.findByIdAndDelete(req.params.id);
    if (!contractor) return res.status(404).json({ message: "Contractor not found" });
    res.json({ message: `Contractor "${contractor.name}" deleted successfully` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;