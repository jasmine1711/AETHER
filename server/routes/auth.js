const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

// ======================= MIDDLEWARE =======================
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1].trim();
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId).select("-password");
    if (!user) return res.status(401).json({ message: "User not found" });

    req.user = user;
    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

// ======================= UTILITIES =======================
const generateToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });

const sendResetEmail = async (user, resetUrl) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });

  await transporter.sendMail({
    to: user.email,
    from: process.env.EMAIL_USER,
    subject: "🔑 Password Reset - AETHER",
    html: `
      <h2>Reset Your AETHER Password</h2>
      <p>Click below to continue:</p>
      <a href="${resetUrl}" style="color:#fff;background:#6C63FF;padding:10px 20px;text-decoration:none;border-radius:5px;">Reset Password</a>
      <p>This link will expire in <b>1 hour</b>.</p>
      <br/><p>— Team AETHER</p>
    `,
  });
};

// ======================= ROUTES =======================

// Test
router.get("/test", (req, res) =>
  res.json({ message: "🔐 AETHER Auth routes working!" })
);

// Get logged in user
router.get("/user", protect, (req, res) => res.json({ user: req.user }));

// Signup
router.post("/signup", async (req, res) => {
  try {
    const { name, email, username, password } = req.body;

    if (!email || !username || !password)
      return res.status(400).json({ message: "Email, username, and password required" });

    if (password.length < 6)
      return res.status(400).json({ message: "Password must be at least 6 characters" });

    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      const msg = existing.email === email ? "Email already exists" : "Username already taken";
      return res.status(400).json({ message: msg });
    }

    const user = new User({ name, email, username, password });
    await user.save();

    res.status(201).json({
      message: "✅ User created successfully, please log in",
      user: { id: user._id, name: user.name, email: user.email, username: user.username },
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Server error during signup" });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { login, password } = req.body;
    if (!login || !password) return res.status(400).json({ message: "Login and password required" });

    const user = await User.findOne({ $or: [{ email: login }, { username: login }] });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = generateToken(user._id);
    res.json({
      message: "🎉 Login successful",
      token,
      user: { id: user._id, name: user.name, email: user.email, username: user.username },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error during login" });
  }
});

// Forgot password
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(200).json({ message: "If registered, you will receive a reset link" });
    }

    const token = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/reset-password/${token}`;
    console.log("Reset URL:", resetUrl);

    // Uncomment in production:
    // await sendResetEmail(user, resetUrl);

    res.status(200).json({ message: "📩 Recovery email sent successfully" });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ message: "Error sending reset email" });
  }
});

// Reset password
router.post("/reset-password/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6)
      return res.status(400).json({ message: "Password must be at least 6 characters" });

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user) return res.status(400).json({ message: "Token invalid or expired" });

    user.password = password; // will be hashed by pre-save
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: "✅ Password reset successful" });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ message: "Server error during reset" });
  }
});

// Logout
router.post("/logout", (req, res) => res.json({ message: "👋 Logout successful" }));

// Admin-only all-users
router.get("/all-users", protect, async (req, res) => {
  try {
    if (!req.user.isAdmin) return res.status(403).json({ message: "Forbidden" });
    const users = await User.find({});
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Error fetching users" });
  }
});

module.exports = router;
