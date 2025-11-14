// routes/authRouter.js
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// JWT Helper
const generateToken = (userId) => jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });

// Register
router.post("/register", async (req, res) => {
  try {
    const { name, username, email, password } = req.body;

    if (!name || !username || !email || !password) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
    }

    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username }],
    });

    if (existingUser) {
      const msg = existingUser.email === email.toLowerCase() ? "Email already registered" : "Username already taken";
      return res.status(400).json({ success: false, message: msg });
    }

    const user = await User.create({
      name,
      username,
      email: email.toLowerCase(),
      password: password,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: { _id: user._id, name: user.name, username: user.username, email: user.email },
      token,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ success: false, message: "Server error during registration" });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { login, password } = req.body;
    
    console.log("Login attempt received. Body:", req.body);
    console.log(`Looking for user with (from req.body.login): ${login}`);

    if (!login || !password) {
      return res.status(400).json({ success: false, message: "Email/Username and password required" });
    }
    
    const isEmail = login.includes("@");
   let user = await User.findOne(isEmail ? { email: login.toLowerCase() } : { username: login }).select("+password");

    if (!user && isEmail) {
      user = await User.findOne({ email: { $regex: new RegExp(`^${login}$`, "i") } }).select("+password");
    }

    if (!user) return res.status(401).json({ success: false, message: "Invalid credentials" });

        // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ success: false, message: "Invalid credentials" });

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: "Login successful",
      user: { _id: user._id, name: user.name, username: user.username, email: user.email },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Server error during login" });
  }
});

// Logout
router.post("/logout", (req, res) => res.json({ success: true, message: "Logged out successfully" }));

// Profile
router.get("/profile", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, user });
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({ success: false, message: "Server error fetching profile" });
  }
});

// Check User
router.post("/check-user", async (req, res) => {
  try {
    const { email, username } = req.body;
    const query = {};
    if (email) query.email = email.toLowerCase();
    if (username) query.username = username;

    const user = await User.findOne(query);
    res.json({
      success: true,
      exists: !!user,
      user: user ? { _id: user._id, name: user.name, username: user.username, email: user.email } : null,
    });
  } catch (error) {
    console.error("Check user error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Test Route
router.get("/test", (req, res) => res.json({ success: true, message: "Auth API is working!", timestamp: new Date().toISOString() }));

export default router;
