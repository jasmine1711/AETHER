// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ================= PROTECT ROUTE (Auth Required) =================
const protect = async (req, res, next) => {
  try {
    // 1. Get token from headers
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ 
        success: false,
        message: "No token provided" 
      });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: "Token missing" 
      });
    }

    // 2. Verify JWT
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ 
        success: false,
        message: "Not authorized, invalid or expired token" 
      });
    }

    // 3. Fetch user from DB (exclude password)
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: "User not found" 
      });
    }

    // 4. Attach to request
    req.user = user;
    req.token = token;

    next();
  } catch (error) {
    console.error("❌ Auth error:", error.message);
    res.status(401).json({ 
      success: false,
      message: "Authorization failed" 
    });
  }
};

// ================= ADMIN-ONLY ROUTE =================
const admin = (req, res, next) => {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ 
      success: false,
      message: "Access denied, admin only" 
    });
  }
  next();
};

module.exports = { protect, admin };