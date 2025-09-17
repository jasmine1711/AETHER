import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import path from "path";
import morgan from "morgan";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

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
  console.warn("⚠️ Missing environment variables (may affect features):", missingEnvVars);
}

// ===== Import Routes =====
import authRoutes from "./routes/auth.js";
import cartRoutes from "./routes/cart.js";
import paymentRoutes from "./routes/payments.js";
import productRoutes from "./routes/products.js";
import wishlistRoutes from "./routes/wishlist.js";
import contactRoutes from "./routes/contact.js";
import reviewRoutes from "./routes/reviews.js";
import styleRoutes from "./routes/style.js";

const app = express();

// ===== Middleware =====
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true,
  methods: ["GET","POST","PUT","DELETE","PATCH"],
  allowedHeaders: ["Content-Type","Authorization"]
}));

app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use(morgan("dev"));

// ===== Static Files =====
// ✅ FIX: Serve static files from the client's public directory
app.use(express.static(path.join(__dirname, '..', 'client', 'public')));

// ===== MongoDB Connection =====
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => {
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
app.use("/api/style", styleRoutes);

// ===== Serve React App in Production =====
// This is important for deployment. It serves the React app for any routes
// not handled by the API.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'client', 'build', 'index.html'));
});

// ===== 404 Handler =====
app.use((req, res) => res.status(404).json({ message: "Route not found" }));

// ===== Global Error Handler =====
app.use((err, req, res, next) => {
  console.error("💥 Error:", err.stack);
  res.status(err.statusCode || 500).json({
    message: process.env.NODE_ENV === "production" ? "Something went wrong!" : err.message
  });
});

// ===== Start Server =====
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || "0.0.0.0";

app.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on http://${HOST}:${PORT}`);

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
    console.log("⚠️ Gemini AI key missing!");
  }
});

export default app;