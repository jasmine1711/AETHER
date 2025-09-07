const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

/* ------------------ Register ------------------ */
router.post("/register", async (req, res) => {
  try {
    const { name, username, email, password } = req.body;

    // Validation
    if (!name || !username || !email || !password) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
    }

    // Check if email or username exists
    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username }]
    });
    if (existingUser) {
      const msg = existingUser.email === email.toLowerCase() ? "Email already registered" : "Username already taken";
      return res.status(400).json({ success: false, message: msg });
    }

    // Create user (password hashing handled in pre-save hook)
    const user = await User.create({ name, username, email: email.toLowerCase(), password });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: { _id: user._id, name: user.name, username: user.username, email: user.email },
      token,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ success: false, message: "Server error during registration", error: error.message });
  }
});

/* ------------------ Login ------------------ */
router.post("/login", async (req, res) => {
  try {
    const { login, password } = req.body;

    if (!login || !password) return res.status(400).json({ success: false, message: "Email/Username and password required" });

    const isEmail = login.includes("@");
    let user = await User.findOne(isEmail ? { email: login.toLowerCase() } : { username: login }).select("+password");

    // If not found, try case-insensitive email
    if (!user && isEmail) {
      user = await User.findOne({ email: { $regex: new RegExp(`^${login}$`, "i") } }).select("+password");
    }

    if (!user) return res.status(401).json({ success: false, message: "Invalid credentials" });

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) return res.status(401).json({ success: false, message: "Invalid credentials" });

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: "Login successful",
      user: { _id: user._id, name: user.name, username: user.username, email: user.email },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Server error during login", error: error.message });
  }
});

/* ------------------ Logout ------------------ */
router.post("/logout", (req, res) => {
  res.json({ success: true, message: "Logged out successfully" });
});

/* ------------------ Get Profile ------------------ */
router.get("/profile", async (req, res) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) return res.status(401).json({ success: false, message: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    res.json({ success: true, user });
  } catch (error) {
    console.error("Profile error:", error);
    res.status(401).json({ success: false, message: "Invalid token" });
  }
});

/* ------------------ Test Route ------------------ */
router.get("/test", (req, res) => {
  res.json({ success: true, message: "Auth API is working!", timestamp: new Date().toISOString() });
});

/* ------------------ Check User Exists ------------------ */
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

module.exports = router;
