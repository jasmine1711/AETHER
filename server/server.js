const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const path = require("path");
const morgan = require("morgan");
require("dotenv").config();

// ===== Validate Environment Variables =====
const requiredEnvVars = [
  'MONGO_URI', 
  'JWT_SECRET', 
  'RAZORPAY_KEY_ID', 
  'RAZORPAY_KEY_SECRET'
];

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingEnvVars);
  process.exit(1);
}

// ===== Import Routes =====
const authRoutes = require("./routes/auth");
const cartRoutes = require("./routes/cart");
const paymentRoutes = require("./routes/payments");
const productRoutes = require("./routes/products");
const wishlistRoutes = require("./routes/wishlist");
const contactRoutes = require("./routes/contact");
const reviewRoutes = require("./routes/reviews");

const app = express();

// ===== Middleware =====
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use(morgan("dev"));

// ===== Static Files =====
app.use("/images", express.static(path.join(__dirname, "public/images")));

// ===== MongoDB Connection =====
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

// ===== API Routes =====
app.use("/api/auth", authRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/products", productRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/reviews", reviewRoutes);

// ===== Health Check =====
app.get("/", (req, res) => {
  res.json({ 
    status: "ok", 
    message: "🎉 Backend is running and healthy!",
    environment: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 5000
  });
});

// ===== Test Razorpay Config Route =====
app.get("/api/test-razorpay", (req, res) => {
  res.json({
    razorpayConfigured: !!process.env.RAZORPAY_KEY_ID && !!process.env.RAZORPAY_KEY_SECRET,
    keyId: process.env.RAZORPAY_KEY_ID ? "Configured" : "Missing",
    port: process.env.PORT || 5000
  });
});

// ===== 404 Handler =====
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// ===== Global Error Handler =====
app.use((err, req, res, next) => {
  console.error("💥 Error:", err.stack);
  res.status(err.statusCode || 500).json({
    message:
      process.env.NODE_ENV === "production"
        ? "Something went wrong!"
        : err.message,
  });
});

// ===== Start Server =====
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0'; // Add this line

app.listen(PORT, HOST, () => {  // Change this line
  console.log(`🚀 Server running on http://${HOST}:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/`);
  console.log(`🔗 Razorpay test: http://localhost:${PORT}/api/test-razorpay`);
  
  // Log Razorpay configuration status
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    console.log("✅ Razorpay is configured");
  } else {
    console.log("❌ Razorpay configuration missing");
  }
});

module.exports = app;