const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// ─────────────────────────────────────────────────────────────
// models/Contractor.js
// status: "pending"  → registered, waiting admin approval
//         "approved" → admin approved, can now login
// ─────────────────────────────────────────────────────────────

const contractorSchema = new mongoose.Schema(
  {
    image: { type: String, default: "" },
    name: { type: String, required: true, trim: true },
    email: { type: String, unique: true, required: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    location: String,
    phoneNumber: String,
    skills: [String],
    machines: [
      {
        type: { type: String, required: true },
        pricePerHour: { type: Number, required: true },
        workerAvailable: { type: Boolean, default: false },
        details: String,
      },
    ],
    wages: Number,
    additionalInfo: String,
    ratings: [
      {
        stars: { type: Number, min: 1, max: 5 },
        description: String,
        userName: String,
      },
    ],
    // "pending"  = just registered, waiting admin approval
    // "approved" = admin approved, contractor can log in
    status: {
      type: String,
      enum: ["pending", "approved"],
      default: "pending",
    },
  },
  { timestamps: true }
);

// Hash password before saving
contractorSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// Compare entered password with hashed password
contractorSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("Contractor", contractorSchema);