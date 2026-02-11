import express from "express";
import User from "../models/User.js";
import { protect, allowRoles } from "../middleware/authMiddleware.js";
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
} from "../controllers/userControllers.js";

const router = express.Router();

//Public registration (no role field)
router.post("/register", createUser); // assigns default "user" role

//  Protected routes 
// Get current user profile
router.get("/me", protect, async (req, res) => {
  const user = await User.findById(req.user._id).populate("roleId").select("-password");
  res.json(user);
});

// Get all users (role-based)
router.get("/", protect, getAllUsers);

// Create user (super-admin only)
router.post("/", protect, allowRoles("super-admin"), createUser);

// Get user by ID (super-admin only)
router.get("/:id", protect, allowRoles("super-admin"), getUserById);

// Update user (super-admin only)
router.put("/:id", protect, allowRoles("super-admin"), updateUser);

// Soft delete user (super-admin only)
router.delete("/:id", protect, allowRoles("super-admin"), deleteUser);

export default router;
