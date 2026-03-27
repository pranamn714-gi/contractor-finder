const express = require("express");
const Contractor = require("../models/Contractor");
const Rating = require("../models/Rating");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// =======================
// POST /api/ratings/:contractorId
// Add or update rating for a contractor
// =======================
router.post("/:contractorId", authMiddleware, async (req, res) => {
  try {
    const { stars, description } = req.body;
    const contractorId = req.params.contractorId;
    const userId = req.user.id; // from auth middleware

    // ✅ Upsert: one rating per user per contractor
    const rating = await Rating.findOneAndUpdate(
      { contractor: contractorId, user: userId },
      { stars, description },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // ✅ Update contractor profile's embedded ratings
    const contractor = await Contractor.findById(contractorId);
    if (!contractor) return res.status(404).json({ message: "Contractor not found" });

    // Replace existing rating from this user if present
    const existingIndex = contractor.ratings.findIndex(r => r.userId?.toString() === userId);

    if (existingIndex >= 0) {
      contractor.ratings[existingIndex] = {
        stars,
        description,
        userId,
        userName: req.user.email
      };
    } else {
      contractor.ratings.push({
        stars,
        description,
        userId,
        userName: req.user.email
      });
    }

    await contractor.save();

    res.json({ message: "Rating saved", rating });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =======================
// GET /api/ratings/:contractorId
// Get all ratings for a contractor
// =======================
router.get("/:contractorId", async (req, res) => {
  try {
    const ratings = await Rating.find({ contractor: req.params.contractorId })
      .populate("user", "name email");
    res.json(ratings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;