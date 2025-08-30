const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const path = require("path");
require("dotenv").config();

// ===== Import Routes =====
const authRoutes = require("./routes/auth");
const cartRoutes = require("./routes/cart");
const paymentRoutes = require("./routes/payments");
const productRoutes = require("./routes/products");
const wishlistRoutes = require("./routes/wishlist");

const app = express();

// ===== Middleware =====
app.use(
  cors({
    origin: [process.env.CLIENT_URL || "http://localhost:3000"], // allow FE
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(cookieParser());

// ===== Static Files =====
app.use("/images", express.static(path.join(__dirname, "public/images")));

// ===== MongoDB Connection =====
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1); // stop app if DB fails
  });

// ===== API Routes =====
app.use("/api/auth", authRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/products", productRoutes);
app.use("/api/wishlist", wishlistRoutes);

// ===== Health Check =====
app.get("/", (req, res) => {
  res.send("🎉 Backend is running and healthy!");
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
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
