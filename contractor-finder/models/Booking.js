const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  contractor: { type: mongoose.Schema.Types.ObjectId, ref: "Contractor", required: true },

  date: { type: Date, required: true },

  // Machine type - required for machine bookings
  machineType: { type: String, required: true },

  // Duration in hours
  duration: { type: Number, required: true, default: 1 },

  // Cancellation notice period in hours
  cancellationHours: { type: Number, default: 24 },

  status: {
    type: String,
    enum: ["pending", "approved", "rejected", "cancelled"],
    default: "pending"
  }
}, { timestamps: true }); // adds createdAt and updatedAt automatically

module.exports = mongoose.model("Booking", bookingSchema);