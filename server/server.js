const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const authRoutes = require("./routes/auth");
const cookieParser = require("cookie-parser");
const path = require("path");

const app = express();

// Middleware
app.use(
  cors({
    origin: "http://localhost:3000", // React frontend
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Serve static images from backend
// Using the more appropriate path from the first version
app.use("/images", express.static(path.join(__dirname, "public/images")));

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", require("./routes/products"));
app.use("/api/payments", require("./routes/payments"));

// Test route - using the more enthusiastic message from the first version
app.get("/", (req, res) => {
  res.send("Backend is running !!");
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});