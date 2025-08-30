const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const path = require("path");

// Routes
const authRoutes = require("./routes/auth");
const cartRoutes = require("./routes/cart");
const paymentRoutes = require("./routes/payments");
const productRoutes = require("./routes/products");
const wishlistRoutes = require("./routes/wishlist");

const app = express();

// ===== Middleware =====
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// ===== Static =====
app.use("/images", express.static(path.join(__dirname, "public/images")));

// ===== MongoDB =====
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// ===== Routes =====
app.use("/api/auth", authRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/products", productRoutes);
app.use("/api/wishlist", wishlistRoutes);

// ===== Test =====
app.get("/", (req, res) => res.send("🎉 Backend is running!"));

// ===== 404 =====
app.use((req, res) => res.status(404).json({ message: "Route not found" }));

// ===== Error =====
app.use((err, req, res, next) => {
  console.error("💥 Error:", err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

// ===== Start =====
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
