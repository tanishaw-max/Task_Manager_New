import Role from '../models/Role.js';
import User from '../models/User.js';

// Get all users (role-based logic remains)
export const getAllUsers = async (req, res) => {
  try {
    const role = (req.user.role || "").toLowerCase();
    let users;

    if (role === "super-admin") {
      users = await User.find({ isDeleted: false }).populate("roleId").select("-password");
    } else if (role === "manager") {
      const userRole = await Role.findOne({ roleTitle: "user" });
      users = await User.find({
        $or: [{ _id: req.user.id }, { roleId: userRole?._id }],
        isDeleted: false
      }).populate("roleId").select("-password");
    } else {
      const self = await User.findById(req.user.id).populate("roleId").select("-password");
      users = [self];
    }

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single user by ID
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('roleId');
    if (!user || user.isDeleted) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update user
export const updateUser = async (req, res) => {
  try {
    const { username, phone, address, isActive, roleTitle, password } = req.body;
    
    const updateData = {};
    if (username) updateData.username = username;
    if (phone) updateData.phone = phone;
    if (address) updateData.address = address;
    if (isActive !== undefined) updateData.isActive = isActive;
    
    // Handle role update
    if (roleTitle) {
      const role = await Role.findOne({ roleTitle: roleTitle.toLowerCase() });
      if (!role) {
        return res.status(400).json({ message: "Invalid role specified" });
      }
      updateData.roleId = role._id;
    }
    
    // Handle password update
    if (password) {
      updateData.password = password; // Will be hashed by pre-save hook
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('roleId');

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User Updated Successfully", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Soft delete user
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true },
      { new: true }
    ).populate('roleId');

    res.status(200).json({ message: "User Deleted Successfully", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create user (for super-admin to create users with specific roles)
export const createUser = async (req, res) => {
  try {
    const { username, email, password, phone, address, roleTitle } = req.body;

    if (!username || !email || !password || !phone || !address) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already exists" });

    // For admin creation: assign specified role or default to 'user'
    const targetRole = roleTitle || "user";
    // amazonq-ignore-next-line
    const role = await Role.findOne({ roleTitle: targetRole.toLowerCase() });
    if (!role) {
      // If role doesn't exist, create default roles
      await createDefaultRoles();
      const defaultRole = await Role.findOne({ roleTitle: "user" });
      if (!defaultRole) {
        return res.status(500).json({ message: "Unable to assign user role" });
      }
      role = defaultRole;
    }

    const user = await User.create({
      username,
      email: email.toLowerCase(),
      password, // Will be hashed by pre-save hook
      phone,
      address,
      roleId: role._id,
    });

    const createdUser = await User.findById(user._id).populate('roleId').select('-password');

    res.status(201).json({
      message: "User created successfully",
      user: createdUser
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper function to create default roles if they don't exist
const createDefaultRoles = async () => {
  const roles = [
    { roleTitle: "user", description: "Basic user access" },
    { roleTitle: "manager", description: "Manage team and tasks" },
    { roleTitle: "super-admin", description: "Full system access" }
  ];

  for (const roleData of roles) {
    const existingRole = await Role.findOne({ roleTitle: roleData.roleTitle });
    if (!existingRole) {
      await Role.create(roleData);
    }
  }
};
