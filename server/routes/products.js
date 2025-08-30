const express = require("express");
const { body, validationResult } = require("express-validator");
const Product = require("../models/Product");
const { protect, admin } = require("../middleware/authMiddleware");

const router = express.Router();

/* ---------- Helpers ---------- */

// sanitize paths: convert backslashes to slashes and ensure leading slash for static URLs
const sanitizePath = (p) => {
  if (!p) return p;
  let s = String(p).replace(/\\/g, "/").trim();
  if (!s) return s;
  if (/^https?:\/\//i.test(s)) return s; // already absolute URL
  return s.startsWith("/") ? s : `/${s}`;
};

// safe getter for first truthy element
const firstTruthy = (arr) => (Array.isArray(arr) ? arr.find(Boolean) : null);

// generate slug from text
const toSlug = (text = "") =>
  String(text).toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "");

// normalize Mongoose product document for frontend
const normalizeProduct = (prodDoc) => {
  const p = prodDoc?.toObject ? prodDoc.toObject() : prodDoc;

  const imagesRaw = Array.isArray(p.images) ? p.images : p.images ? [p.images] : [];
  const images = imagesRaw.map((img) => sanitizePath(img)).filter(Boolean);

  const thumbnailRaw = p.thumbnail || p.image || firstTruthy(images) || p.coverImage || null;
  const thumbnail = sanitizePath(thumbnailRaw) || "/images/placeholders/default.jpg";

  const category = p.category || p.categoryName || "Uncategorized";

  return {
    id: p.id || p._id?.toString?.(),
    _id: p._id?.toString?.(),
    name: p.name || "",
    description: p.description || "",
    brand: p.brand || "",
    price: p.price ?? 0,
    condition: p.condition || "",
    badge: p.badge || null,
    sizes: Array.isArray(p.sizes) ? p.sizes : [],
    images,
    thumbnail,
    category,
    categorySlug: toSlug(category),
    reviews: Array.isArray(p.reviews) ? p.reviews : [],
    numReviews: p.numReviews ?? (Array.isArray(p.reviews) ? p.reviews.length : 0),
    rating: p.rating ?? 0,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
};

/* ---------- Public Routes ---------- */

// GET all products (with optional ?category & ?exclude)
router.get("/", async (req, res) => {
  try {
    const { category, exclude } = req.query;
    let filter = {};
    if (category) filter.category = category;
    if (exclude) filter._id = { $ne: exclude };

    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .populate("reviews.user", "name email");

    res.json(products.map(normalizeProduct));
  } catch (err) {
    console.error("GET /api/products error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// GET single product by ID
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("reviews.user", "name email");
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(normalizeProduct(product));
  } catch (err) {
    console.error("GET /api/products/:id error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/* ---------- Admin CRUD Routes ---------- */

// CREATE product
router.post(
  "/",
  protect,
  admin,
  [
    body("name", "Name is required").notEmpty(),
    body("price", "Price must be a number").isFloat({ gt: 0 }),
    body("category", "Category is required").notEmpty(),
    body("thumbnail", "Thumbnail image is required").notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      if (req.body.thumbnail) req.body.thumbnail = sanitizePath(req.body.thumbnail);
      if (req.body.image) req.body.image = sanitizePath(req.body.image);
      if (Array.isArray(req.body.images)) req.body.images = req.body.images.map(sanitizePath);

      const product = await Product.create(req.body);
      res.status(201).json(normalizeProduct(product));
    } catch (err) {
      console.error("POST /api/products error:", err);
      res.status(400).json({ message: "Invalid data", error: err.message });
    }
  }
);

// UPDATE product
router.put(
  "/:id",
  protect,
  admin,
  [
    body("price").optional().isFloat({ gt: 0 }).withMessage("Price must be greater than 0"),
    body("name").optional().notEmpty().withMessage("Name cannot be empty"),
    body("thumbnail").optional().notEmpty().withMessage("Thumbnail cannot be empty"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      if (req.body.thumbnail) req.body.thumbnail = sanitizePath(req.body.thumbnail);
      if (req.body.image) req.body.image = sanitizePath(req.body.image);
      if (Array.isArray(req.body.images)) req.body.images = req.body.images.map(sanitizePath);

      const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });

      if (!product) return res.status(404).json({ message: "Product not found" });
      res.json(normalizeProduct(product));
    } catch (err) {
      console.error("PUT /api/products/:id error:", err);
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
    console.error("DELETE /api/products/:id error:", err);
    res.status(500).json({ message: "Delete failed", error: err.message });
  }
});

/* ---------- Reviews ---------- */

// POST a review
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

      const alreadyReviewed = product.reviews.find((r) => r.user.toString() === req.user.id);
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

      res
        .status(201)
        .json({ message: "Review added", product: normalizeProduct(populatedProduct) });
    } catch (err) {
      console.error("POST /api/products/:id/reviews error:", err);
      res.status(400).json({ message: "Review failed", error: err.message });
    }
  }
);

/* ---------- Test Route ---------- */
router.get("/test/hello", (req, res) => {
  res.json({ message: "Products routes are working!" });
});

module.exports = router;