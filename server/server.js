import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import path from "path";
import morgan from "morgan";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import listEndpoints from "express-list-endpoints";
import fs from 'fs';

dotenv.config();

// ===== Directory Helpers =====
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ===== Validate Env Variables =====
const requiredEnvVars = [
  "MONGO_URI",
  "JWT_SECRET",
  "RAZORPAY_KEY_ID",
  "RAZORPAY_KEY_SECRET",
  "GEMINI_API_KEY",
];

const missingEnvVars = requiredEnvVars.filter((v) => !process.env[v]);
if (missingEnvVars.length > 0) {
  console.warn(
    "⚠️ Missing environment variables (may affect features):",
    missingEnvVars
  );
}

// ===== Import Routes =====
import authRoutes from "./routes/auth.js";
import cartRoutes from "./routes/cart.js";
import paymentRoutes from "./routes/payments.js";
import productRoutes from "./routes/products.js";
import wishlistRoutes from "./routes/wishlist.js";
import contactRoutes from "./routes/contact.js";
import reviewRoutes from "./routes/reviews.js";
import userRoutes from './routes/users.js';
import aiRoutes from "./routes/aiRoutes.js";

const app = express();

// ===== Middleware =====
const allowedOrigins = [
  "http://localhost:3000",
  "https://velvety-basbousa-666b8c.netlify.app",
  "https://aether-backend-7uwv.onrender.com"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`⚠️ CORS blocked request from: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use(morgan("dev"));

// ===== MongoDB Connection =====
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

// ===== API Routes =====
app.use("/api/auth", authRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api", paymentRoutes);
app.use("/api/products", productRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/reviews", reviewRoutes);
app.use('/api/users', userRoutes);
app.use("/api/ai", aiRoutes);

// ===== Health Check Endpoint (for Render) =====
app.get("/health", (req, res) => {
  res.status(200).json({ 
    status: "OK", 
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? "connected" : "disconnected"
  });
});

// ===== Serve Static Images =====
const imagesPath = path.join(__dirname, "..", "client", "public", "images");
const altImagesPath = path.join(__dirname, "public", "images");

if (fs.existsSync(imagesPath)) {
  app.use("/images", express.static(imagesPath));
  console.log(`✅ Serving images from: ${imagesPath}`);
} else if (fs.existsSync(altImagesPath)) {
  app.use("/images", express.static(altImagesPath));
  console.log(`✅ Serving images from: ${altImagesPath}`);
} else {
  console.warn("⚠️ No images directory found. Images will not be served.");
  app.use("/images", (req, res) => {
    res.status(404).json({ error: "Image not found" });
  });
}

// ===== Serve React App in Production =====
if (process.env.NODE_ENV === "production") {
  const buildPath = path.join(__dirname, "..", "client", "build");
  
  // ✅ FIXED: Use fs.existsSync instead of require('fs').existsSync
  if (fs.existsSync(buildPath)) {
    app.use(express.static(buildPath));
    console.log(`✅ Serving React app from: ${buildPath}`);
    
    // Fallback for React Router
    app.get("/*", (req, res) => {
      res.sendFile(path.join(buildPath, "index.html"));
    });
  } else {
    console.warn(`⚠️ Build folder not found at: ${buildPath}`);
  }
}

// ===== 404 Handler (only for API routes) =====
app.use((req, res, next) => {
  if (req.originalUrl.startsWith("/api")) {
    return res.status(404).json({ 
      success: false,
      message: "Route not found",
      requestedUrl: req.originalUrl 
    });
  }
  next();
});

// ===== Global Error Handler =====
app.use((err, req, res, next) => {
  console.error("💥 Error:", err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: process.env.NODE_ENV === "production"
      ? "Something went wrong!"
      : err.message,
  });
});

// ===== Start Server =====
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || "0.0.0.0";

app.listen(PORT, HOST, () => {
  console.log(`\n🚀 Server running on http://${HOST}:${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || "development"}`);
  
  // Razorpay Status
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    console.log("✅ Razorpay is configured");
  } else {
    console.log("⚠️ Razorpay keys missing! Payment routes may not work.");
  }
  
  // Gemini AI Status
  if (process.env.GEMINI_API_KEY) {
    console.log("✅ Gemini AI is configured");
  } else {
    console.log("⚠️ Gemini AI key missing! AI features may not work.");
  }
});

// ===== Debug: List all registered routes =====
console.log("\n📌 Registered Routes:");
const endpoints = listEndpoints(app);
const apiEndpoints = endpoints.filter(e => e.path.startsWith('/api'));
console.table(apiEndpoints);

export default app;