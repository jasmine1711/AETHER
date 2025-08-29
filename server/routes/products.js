const express = require("express");
const { body, validationResult } = require("express-validator");
const Product = require("../models/Product");
const { protect, admin } = require("../middleware/authMiddleware");

const router = express.Router();

/* ---------- Public Routes ---------- */

// GET all products
router.get("/", async (req, res) => {
  try {
    const products = await Product.find()
      .sort({ createdAt: -1 })
      .populate("reviews.user", "name email"); 
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// GET single product
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "reviews.user",
      "name email"
    );
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/* ---------- Admin CRUD Routes ---------- */

// POST create product
router.post(
  "/",
  protect,
  admin,
  [
    body("name", "Name is required").notEmpty(),
    body("price", "Price must be a number").isFloat({ gt: 0 }),
    body("category", "Category is required").notEmpty(),
    body("thumbnail", "Thumbnail image is required").notEmpty(), // ✅ NEW VALIDATION
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const product = await Product.create(req.body);
      res.status(201).json(product);
    } catch (err) {
      res.status(400).json({ message: "Invalid data", error: err.message });
    }
  }
);

// PUT update product
router.put(
  "/:id",
  protect,
  admin,
  [
    body("price").optional().isFloat({ gt: 0 }).withMessage("Price must be greater than 0"),
    body("name").optional().notEmpty().withMessage("Name cannot be empty"),
    body("thumbnail").optional().notEmpty().withMessage("Thumbnail cannot be empty"), // ✅ allow updating thumbnail
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });
      if (!product) return res.status(404).json({ message: "Product not found" });
      res.json(product);
    } catch (err) {
      res.status(400).json({ message: "Update failed", error: err.message });
    }
  }
);

// DELETE product
router.delete("/:id", protect, admin, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed", error: err.message });
  }
});

/* ---------- Reviews ---------- */

// POST add review
router.post(
  "/:id/reviews",
  protect,
  [
    body("rating", "Rating must be between 1 and 5").isInt({ min: 1, max: 5 }),
    body("comment", "Comment is required").notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { rating, comment } = req.body;
      const product = await Product.findById(req.params.id);
      if (!product) return res.status(404).json({ message: "Product not found" });

      const alreadyReviewed = product.reviews.find(
        (r) => r.user.toString() === req.user.id
      );
      if (alreadyReviewed)
        return res.status(400).json({ message: "Product already reviewed" });

      product.reviews.push({
        name: req.user.name || "User",
        rating: Number(rating),
        comment,
        user: req.user.id,
      });

      product.numReviews = product.reviews.length;
      product.rating =
        product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length;

      await product.save();

      const populatedProduct = await Product.findById(req.params.id).populate(
        "reviews.user",
        "name email"
      );

      res.status(201).json({ message: "Review added", product: populatedProduct });
    } catch (err) {
      res.status(400).json({ message: "Review failed", error: err.message });
    }
  }
);

// Test route
router.get("/test/hello", (req, res) => {
  res.json({ message: "Products routes are working!" });
});

module.exports = router;
