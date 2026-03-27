/**
 * scripts/seedAdmin.js
 *
 * Run ONCE to create the default admin account in MongoDB.
 *
 * Usage:
 *   node scripts/seedAdmin.js
 *
 * Make sure your .env has:
 *   MONGO_URI=...
 *   ADMIN_EMAIL=admin@example.com
 *   ADMIN_PASSWORD=yourSecurePassword
 */

require("dotenv").config();
const mongoose = require("mongoose");
const Admin = require("../models/Admin");

async function seedAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");

    const existingAdmin = await Admin.findOne({ email: process.env.ADMIN_EMAIL });

    if (existingAdmin) {
      console.log(`⚠️  Admin already exists: ${process.env.ADMIN_EMAIL}`);
      process.exit(0);
    }

    // Admin model hashes password automatically via pre-save hook
    const admin = new Admin({
      name: "Super Admin",
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
    });

    await admin.save();
    console.log("✅ Default admin created successfully!");
    console.log(`   Email   : ${process.env.ADMIN_EMAIL}`);
    console.log(`   Password: ${process.env.ADMIN_PASSWORD}`);
    console.log("   ⚠️  Change the password after first login!");

    process.exit(0);
  } catch (err) {
    console.error("❌ Error seeding admin:", err.message);
    process.exit(1);
  }
}

seedAdmin();