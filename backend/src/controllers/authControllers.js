import User from "../models/User.js";
import Role from "../models/Role.js";
import jwt from "jsonwebtoken";
import validator from "validator";

const generateToken = (user) =>
  jwt.sign(
    {
      id: user._id,
      role: user.roleId?.roleTitle,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
const emailRegex = /^[a-z0-9]+@[a-z]+\.[a-z]{2,3}$/;

export const register = async (req, res) => {
  try {
    const { username, email, password, phone, address } = req.body;

    // Input validation
    if (!username || !email || !password || !phone || !address) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Email must be like riya12@gmail.com" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    if (!/^\d{10}$/.test(phone)) {
    return res.status(400).json({ message: "Phone must be exactly 10 digits" });
}

    // Sanitize inputs
    const sanitizedData = {
      username: validator.escape(username.trim()),
      email: validator.normalizeEmail(email),
      password: password.trim(),
      phone: phone.trim(),
      address: validator.escape(address.trim())
    };

    const existingUser = await User.findOne({ email: sanitizedData.email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Always assign default role = user for public registration
    let userRole = await Role.findOne({ roleTitle: "user" });
    if (!userRole) {
      // Create default roles if they don't exist
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
      
      userRole = await Role.findOne({ roleTitle: "user" });
    }

    const user = await User.create({
      username: sanitizedData.username,
      email: sanitizedData.email,
      password: sanitizedData.password,
      phone: sanitizedData.phone,
      address: sanitizedData.address,
      roleId: userRole._id,
    });
    const populatedUser = await user.populate("roleId");
    const token = generateToken(user);

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: "user",
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      message: "Server error",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Input validation
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Email must be like riya12@gmail.com" });
    }
    
    console.log('Login attempt:', { email: validator.normalizeEmail(email) });

    // Fixed admin credentials
    const normalizedEmail = validator.normalizeEmail(email);
    if (normalizedEmail === "admin@taskmanager.com" && password === "admin123") {
      console.log('Admin login detected');
      const token = jwt.sign(
        { id: "admin", role: "super-admin" },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );
      
      return res.status(200).json({
        message: "Admin login successful",
        token,
        user: {
          _id: "admin",
          username: "admin",
          email: "admin@taskmanager.com",
          role: "super-admin",
        },
      });
    }

    console.log('Checking database for user:', normalizedEmail);
    const user = await User.findOne({ email: normalizedEmail })
      .select("+password")
      .populate("roleId");

    if (!user) {
      console.log('User not found:', normalizedEmail);
      return res.status(400).json({
        message: "User not found",
      });
    }

    if (user.isDeleted) {
      console.log('User is deleted:', normalizedEmail);
      return res.status(400).json({
        message: "User not found",
      });
    }

    if (!(await user.comparePassword(password))) {
      console.log('Invalid password for:', normalizedEmail);
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    if (!user.isActive) {
      return res.status(400).json({
        message: "Account is deactivated",
      });
    }

    const token = generateToken(user);

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.roleId?.roleTitle,
      },
      
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      message: "Server error",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};


