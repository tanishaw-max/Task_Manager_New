import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "./src/models/User.js";
import Role from "./src/models/Role.js";

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Create roles if they don't exist
    const roles = [
      { roleTitle: "super-admin", description: "Full system access" },
      { roleTitle: "manager", description: "Manage team and tasks" },
      { roleTitle: "user", description: "Basic user access" }
    ];

    for (const roleData of roles) {
      const existingRole = await Role.findOne({ roleTitle: roleData.roleTitle });
      if (!existingRole) {
        await Role.create(roleData);
        console.log(`Created role: ${roleData.roleTitle}`);
      }
    }

    // Create admin user
    const adminEmail = process.env.ADMIN_EMAIL || "admin@taskmanager.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (!existingAdmin) {
      const superAdminRole = await Role.findOne({ roleTitle: "super-admin" });
      
      const adminUser = await User.create({
        username: "admin",
        email: adminEmail,
        password: adminPassword, // Will be hashed by pre-save hook
        phone: process.env.ADMIN_PHONE || "1234567890",
        address: process.env.ADMIN_ADDRESS || "Admin Address",
        roleId: superAdminRole._id,
        isActive: true
      });

      console.log("Fixed admin user created:");
      console.log(`Email: ${adminEmail}`);
      console.log("Password: [HIDDEN]");
    } else {
      console.log("Admin user already exists");
    }

    process.exit(0);
  } catch (error) {
    console.error("Error seeding admin:", error);
    process.exit(1);
  }
};

seedAdmin();