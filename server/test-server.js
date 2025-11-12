import express from "express";

const app = express();

// ✅ simple test route
app.get("/ping", (req, res) => {
  res.json({ message: "pong" });
});

// ✅ catch-all React fallback (must use /* in Express 5)
app.get("/*", (req, res) => {
  res.send("React fallback works!");
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Test server running on http://localhost:${PORT}`);
});
