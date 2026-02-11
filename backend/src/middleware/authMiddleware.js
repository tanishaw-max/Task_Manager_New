import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Role from "../models/Role.js";
import mongoose from "mongoose";

// Create a consistent ObjectId for admin user
const ADMIN_USER_ID = new mongoose.Types.ObjectId('507f1f77bcf86cd799439011');



// Verify JWT and attach user + role to req.user
export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

    if (!token) {
      return res.status(401).json({ message: "Access denied. No token provided." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (!decoded.id || !decoded.role) {
      return res.status(401).json({ message: "Invalid token format" });
    }

    // Handle hardcoded admin user
    if (decoded.id === "admin" && decoded.role === "super-admin") {
      req.user = {
        _id: ADMIN_USER_ID,
        username: "admin",
        email: "admin@taskmanager.com",
        role: "super-admin",
        roleId: null,
      };
      return next();
    }

    // Validate ObjectId format
    if (!decoded.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(401).json({ message: "Invalid user ID format" });
    }

    const user = await User.findById(decoded.id).populate("roleId");
    if (!user || user.isDeleted || !user.isActive) {
      return res.status(401).json({ message: "User not found or inactive" });
    }

    req.user = {
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.roleId?.roleTitle || "user",
      roleId: user.roleId?._id,
    };

    next();
  } catch (error) {
    console.error("Auth middleware error:", error.message);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: "Invalid token" });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: "Token expired" });
    }
    return res.status(401).json({ message: "Authentication failed" });
  }
};

// Allow only specific roles
export const allowRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const userRole = (req.user.role || "").toLowerCase();
    const canAccess = allowedRoles
      .map((r) => r.toLowerCase())
      .includes(userRole);

    if (!canAccess) {
      return res.status(403).json({ message: "Access denied" });
    }

    next();
  };
};

