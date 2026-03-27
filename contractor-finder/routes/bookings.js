const express = require("express");
const Booking = require("../models/Booking");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// =======================
// User creates booking
// =======================
router.post("/create", authMiddleware, async (req, res) => {
  try {
    const { contractor, contractorId, date, machineType, duration, cancellationHours } = req.body;

    // Support both 'contractor' and 'contractorId' field names
    const contractorFieldId = contractor || contractorId;

    if (!contractorFieldId) {
      return res.status(400).json({ message: "Contractor ID is required" });
    }

    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }

    if (!machineType) {
      return res.status(400).json({ message: "Machine type is required" });
    }

    if (!duration) {
      return res.status(400).json({ message: "Duration is required" });
    }

    const booking = new Booking({
      user: req.user.id,
      contractor: contractorFieldId,
      date,
      machineType,
      duration: Number(duration),
      cancellationHours: cancellationHours ? Number(cancellationHours) : 24,
      status: "pending"
    });

    await booking.save();
    
    // Populate contractor details before sending response
    await booking.populate("contractor", "name email phoneNumber location");
    
    res.json({ 
      message: "Booking created successfully",
      booking 
    });
  } catch (err) {
    console.error("Booking creation error:", err);
    res.status(500).json({ message: "Error creating booking", error: err.message });
  }
});

// =======================
// User sees their bookings
// =======================
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate(
        "contractor",
        "name email phoneNumber location skills machines wages additionalInfo ratings image"
      )
      .sort({ createdAt: -1 }); // Most recent first
    res.json(bookings);
  } catch (err) {
    console.error("Fetch user bookings error:", err);
    res.status(500).json({ error: err.message });
  }
});

// =======================
// Contractor sees bookings
// =======================
router.get("/contractor/me", authMiddleware, async (req, res) => {
  try {
    const bookings = await Booking.find({ contractor: req.user.id })
      .populate("user", "name email")
      .sort({ createdAt: -1 }); // Most recent first
    res.json(bookings);
  } catch (err) {
    console.error("Fetch contractor bookings error:", err);
    res.status(500).json({ error: err.message });
  }
});

// =======================
// Contractor updates booking status
// =======================
router.patch("/update-status/:id", authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    
    // Validate status
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status. Use 'approved' or 'rejected'" });
    }

    const booking = await Booking.findOne({ 
      _id: req.params.id, 
      contractor: req.user.id 
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.status !== "pending") {
      return res.status(400).json({ message: "Only pending bookings can be updated" });
    }

    booking.status = status;
    await booking.save();
    
    res.json({ 
      message: `Booking ${status}`,
      booking 
    });
  } catch (err) {
    console.error("Update booking status error:", err);
    res.status(500).json({ error: err.message });
  }
});

// =======================
// Cancel booking (user)
// =======================
router.patch("/cancel/:bookingId", authMiddleware, async (req, res) => {
  try {
    const booking = await Booking.findOne({ 
      _id: req.params.bookingId, 
      user: req.user.id 
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.status !== "pending") {
      return res.status(400).json({ 
        message: `Cannot cancel ${booking.status} booking. Only pending bookings can be cancelled.` 
      });
    }

    // Check cancellation window based on the booking's cancellationHours
    const now = new Date();
    const bookingDate = new Date(booking.date);
    const diffMs = bookingDate - now;
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours < booking.cancellationHours) {
      return res.status(400).json({ 
        message: `Cancellation must be made at least ${booking.cancellationHours} hours before the booking date` 
      });
    }

    booking.status = "cancelled";
    await booking.save();
    
    res.json({ 
      message: "Booking cancelled successfully", 
      booking 
    });
  } catch (err) {
    console.error("Cancel booking error:", err);
    res.status(500).json({ error: err.message });
  }
});

// =======================
// Delete booking (optional - for testing)
// =======================
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const booking = await Booking.findOne({ 
      _id: req.params.id, 
      user: req.user.id 
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    await booking.deleteOne();
    res.json({ message: "Booking deleted successfully" });
  } catch (err) {
    console.error("Delete booking error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;