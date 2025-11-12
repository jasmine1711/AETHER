// ✅ FIX: Changed to ES Module syntax
import express from "express";
import { body, validationResult } from "express-validator";
import Product from "../models/Product.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// POST: Add a review
router.post(
  "/:productId",
  protect,
  [
    body("rating").isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5"),
    body("comment").notEmpty().withMessage("Comment is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { productId } = req.params;
      const { rating, comment } = req.body;

      const product = await Product.findById(productId);
      if (!product) return res.status(404).json({ message: "Product not found" });

      const alreadyReviewed = product.reviews.find(
        (r) => r.user.toString() === req.user._id.toString()
      );
      if (alreadyReviewed) {
        return res.status(400).json({ message: "You have already reviewed this product" });
      }

      const review = {
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment,
      };

      product.reviews.push(review);

      product.numReviews = product.reviews.length;
      product.rating =
        product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length;

      await product.save();

      res.status(201).json({ message: "Review added", review });
    } catch (err) {
      console.error("POST /api/reviews error:", err);
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }
);

// GET: Reviews for a product
router.get("/:productId", async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId).populate("reviews.user", "name email");
    if (!product) return res.status(404).json({ message: "Product not found" });

    res.json(product.reviews);
  } catch (err) {
    console.error("GET /api/reviews error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ FIX: Changed to ES Module syntax
export default router;