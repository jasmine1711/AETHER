// ✅ FIX: Changed to ES Module syntax
import express from "express";
import { body, validationResult } from "express-validator";
import Product from "../models/Product.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ---------- Helpers ---------- */
const sanitizePath = (p) => {
  if (!p) return p;
  let s = String(p).replace(/\\/g, "/").trim();
  if (!s) return s;
  if (/^https?:\/\//i.test(s)) return s;
  return s.startsWith("/") ? s : `/${s}`;
};

const firstTruthy = (arr) => (Array.isArray(arr) ? arr.find(Boolean) : null);
const toSlug = (text = "") =>
  String(text).toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "");

const normalizeProduct = (prodDoc) => {
  const p = prodDoc?.toObject ? prodDoc.toObject() : prodDoc;

  const imagesRaw = Array.isArray(p.images) ? p.images : p.images ? [p.images] : [];
  const images = imagesRaw.map((img) => sanitizePath(img)).filter(Boolean);

  const thumbnailRaw = p.thumbnail || p.image || firstTruthy(images) || p.coverImage || null;
  const thumbnail = sanitizePath(thumbnailRaw) || "/images/default.jpg";

  const category = p.category || "Uncategorized";

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
    numReviews: 0,
    rating: 0,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
};

/* ---------- Test Route (MUST be above :id) ---------- */
router.get("/test/hello", (req, res) => {
  res.json({ message: "Products routes are working!" });
});

/* ---------- Public Routes ---------- */
// GET all products with optional category, exclude, pagination
router.get("/", async (req, res) => {
  try {
    const { category, exclude, page = 1, limit = 12 } = req.query;
    let filter = {};

    if (category) {
      filter.category = new RegExp(`^${category}$`, "i"); // case-insensitive match
    }
    if (exclude) {
      filter._id = { $ne: exclude };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Product.countDocuments(filter),
    ]);

    res.json({
      products: products.map(normalizeProduct),
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      total,
    });
  } catch (err) {
    console.error("GET /api/products error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// GET single product by slug
router.get("/slug/:slug", async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug });
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(normalizeProduct(product));
  } catch (err) {
    console.error("GET /api/products/slug/:slug error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


// GET single product by ID
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
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

// ✅ FIX: Changed to ES Module syntax
export default router;