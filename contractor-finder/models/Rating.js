const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema(
  {
    contractor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contractor",
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    stars: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },
    description: {
      type: String,
      trim: true
    }
  },
  { timestamps: true } // ✅ adds createdAt and updatedAt automatically
);

// ✅ Ensure one rating per user per contractor
ratingSchema.index({ contractor: 1, user: 1 }, { unique: true });

module.exports = mongoose.model("Rating", ratingSchema);