const express = require("express");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const Contractor = require("../models/Contractor");
const Booking = require("../models/Booking");

const router = express.Router();

// =======================
// Middleware to verify JWT
// =======================
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "No token provided" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role, email }
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

// =======================
// Role-based guard
// =======================
function requireRole(role) {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({ message: "Forbidden: insufficient role" });
    }
    next();
  };
}

// =======================
// Multer setup for image uploads
// =======================
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({ storage });

// =======================
// POST /api/contractors
// Admin creates contractor
// =======================
router.post("/", async (req, res) => {
  try {
    const contractor = new Contractor({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      location: req.body.location,
      skills: req.body.skills,
      machines: req.body.machines?.map(m => ({
        type: m.type,
        pricePerHour: m.pricePerHour,
        workerAvailable: m.workerAvailable,
        details: m.details
      })),
      phoneNumber: req.body.phoneNumber,
      wages: req.body.wages,
      additionalInfo: req.body.additionalInfo,
      image: req.body.image // optional if admin sets image URL directly
    });
    await contractor.save();
    res.json(contractor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// =======================
// PATCH /api/contractors/update-profile
// Contractor updates own profile
// =======================
router.patch("/update-profile", authMiddleware, requireRole("contractor"), async (req, res) => {
  try {
    const { skills, machines, location, phoneNumber, wages, additionalInfo, image } = req.body;

    const contractor = await Contractor.findByIdAndUpdate(
      req.user.id,
      {
        ...(skills && { skills }),
        ...(machines && {
          machines: machines.map(m => ({
            type: m.type,
            pricePerHour: m.pricePerHour,
            workerAvailable: m.workerAvailable,
            details: m.details
          }))
        }),
        ...(location && { location }),
        ...(phoneNumber && { phoneNumber }),
        ...(wages && { wages }),
        ...(additionalInfo && { additionalInfo }),
        ...(image && { image }),
        detailsAdded: true
      },
      { new: true }
    );

    if (!contractor) return res.status(404).json({ message: "Contractor not found" });

    res.json({ message: "Profile updated successfully", contractor });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =======================
// POST /api/contractors/upload-image
// Contractor uploads profile image
// =======================
router.post("/upload-image", authMiddleware, requireRole("contractor"), upload.single("image"), async (req, res) => {
  try {
    const contractor = await Contractor.findById(req.user.id);
    if (!contractor) return res.status(404).json({ message: "Contractor not found" });

    contractor.image = req.file.path; // save file path
    await contractor.save();

    res.json({ message: "Image uploaded successfully", contractor });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =======================
// GET /api/contractors/me
// Contractor fetches their own profile
// =======================
router.get("/me", authMiddleware, requireRole("contractor"), async (req, res) => {
  try {
    const contractor = await Contractor.findById(req.user.id);
    if (!contractor) return res.status(404).json({ message: "Contractor not found" });
    res.json(contractor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =======================
// GET /api/contractors/bookings
// Contractor sees their booking requests
// =======================
router.get("/bookings", authMiddleware, requireRole("contractor"), async (req, res) => {
  try {
    const bookings = await Booking.find({ contractor: req.user.id }).populate("user", "name email");
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =======================
// GET /api/contractors
// User fetches all contractor profiles
// =======================
router.get("/", authMiddleware, requireRole("user"), async (req, res) => {
  try {
    const contractors = await Contractor.find();
    res.json(contractors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =======================
// GET /api/contractors/:id
// User fetches single contractor profile
// =======================
router.get("/:id", authMiddleware, requireRole("user"), async (req, res) => {
  try {
    const contractor = await Contractor.findById(req.params.id);
    if (!contractor) return res.status(404).json({ message: "Contractor not found" });
    res.json(contractor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =======================
// PUT /api/contractors/:id
// Admin updates contractor by ID
// =======================
router.put("/:id", async (req, res) => {
  try {
    const contractor = await Contractor.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        email: req.body.email,
        location: req.body.location,
        skills: req.body.skills,
        machines: req.body.machines?.map(m => ({
          type: m.type,
          pricePerHour: m.pricePerHour,
          workerAvailable: m.workerAvailable,
          details: m.details
        })),
        phoneNumber: req.body.phoneNumber,
        wages: req.body.wages,
        additionalInfo: req.body.additionalInfo,
        image: req.body.image
      },
      { new: true }
    );
    if (!contractor) return res.status(404).json({ message: "Contractor not found" });
    res.json(contractor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;