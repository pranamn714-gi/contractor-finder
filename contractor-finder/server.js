const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const authRoutes       = require("./routes/auth");
const contractorRoutes = require("./routes/contractors");
const bookingRoutes    = require("./routes/bookings");
const ratingRoutes     = require("./routes/ratings");
const uploadRoutes     = require("./routes/upload");
const adminRoutes      = require("./routes/adminroute");
const Admin            = require("./models/Admin");

const app = express();

// CORS
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.static("public"));

// Routes
app.use("/api/auth",        authRoutes);
app.use("/api/contractors", contractorRoutes);
app.use("/api/bookings",    bookingRoutes);
app.use("/api/ratings",     ratingRoutes);
app.use("/api/upload",      uploadRoutes);
app.use("/api/admin",       adminRoutes);

// Connect to MongoDB then start server
mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ MongoDB connected");

    // Auto-seed default admin if none exists
    const existingAdmin = await Admin.findOne({ email: process.env.ADMIN_EMAIL });
    if (!existingAdmin) {
      // NOTE: Admin model auto-hashes via pre-save hook — do NOT pre-hash here
      const admin = new Admin({
        name: "Super Admin",
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
      });
      await admin.save();
      console.log(`✅ Default admin created: ${process.env.ADMIN_EMAIL}`);
    }

    app.listen(process.env.PORT || 5000, () =>
      console.log(`🚀 Server running on port ${process.env.PORT || 5000}`)
    );
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));