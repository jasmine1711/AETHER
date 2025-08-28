// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

async function protect(req, res, next) {
  try {
    // Use lowercase headers safely
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token, authorization denied" });
    }

    // Extract token correctly
    const token = authHeader.split(" ")[1].trim();

    if (!token) {
      return res.status(401).json({ message: "Token missing, authorization denied" });
    }

    // Verify JWT
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    // Fetch user from DB and exclude password
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(401).json({ message: "User not found, invalid token" });
    }

    // Attach user to request
    req.user = user;
    req.token = token;

    next();
  } catch (error) {
    console.error("Auth error:", error.message);
    res.status(401).json({ message: "Authorization failed" });
  }
}

// Admin-only middleware
function admin(req, res, next) {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ message: "Access denied, admin only" });
  }
  next();
}

module.exports = { protect, admin };
