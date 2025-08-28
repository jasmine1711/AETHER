const express = require("express");
const { body, validationResult } = require("express-validator");
const Wishlist = require("../models/Wishlist");
const Product = require("../models/Product");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

/* ---------- Get User Wishlist ---------- */
router.get("/", protect, async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id }).populate("products");
    if (!wishlist) return res.json({ products: [] });
    res.json(wishlist);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/* ---------- Add Product to Wishlist ---------- */
router.post(
  "/:productId",
  protect,
  async (req, res) => {
    const { productId } = req.params;

    try {
      const product = await Product.findById(productId);
      if (!product) return res.status(404).json({ message: "Product not found" });

      let wishlist = await Wishlist.findOne({ user: req.user._id });
      if (!wishlist) wishlist = await Wishlist.create({ user: req.user._id, products: [] });

      if (!wishlist.products.includes(productId)) {
        wishlist.products.push(productId);
        await wishlist.save();
      }

      const populatedWishlist = await wishlist.populate("products");
      res.status(201).json(populatedWishlist);
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }
);

/* ---------- Remove Product from Wishlist ---------- */
router.delete("/:productId", protect, async (req, res) => {
  const { productId } = req.params;
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) return res.status(404).json({ message: "Wishlist not found" });

    wishlist.products = wishlist.products.filter((id) => id.toString() !== productId);
    await wishlist.save();

    const populatedWishlist = await wishlist.populate("products");
    res.json(populatedWishlist);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
