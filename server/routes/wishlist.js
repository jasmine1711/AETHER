import express from "express";
import mongoose from "mongoose";
import Wishlist from "../models/Wishlist.js";
import Product from "../models/Product.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ---------- Get User Wishlist ---------- */
router.get("/", protect, async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id }).populate("products");
    if (!wishlist) {
      return res.json({ user: req.user._id, products: [] });
    }
    res.json(wishlist);
  } catch (err) {
    console.error("GET WISHLIST ERROR:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

/* ---------- Add Product to Wishlist ---------- */
router.post("/:productId", protect, async (req, res) => {
  const { productId } = req.params;
  try {
    let product;
    if (mongoose.Types.ObjectId.isValid(productId)) {
      product = await Product.findById(productId);
    }
    if (!product) {
      product = await Product.findOne({
        name: { $regex: new RegExp(productId.replace(/-/g, ' '), "i") }
      });
    }
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    const realProductId = product._id;
    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, products: [realProductId] });
    } else {
      if (!wishlist.products.some(p => p.equals(realProductId))) {
        wishlist.products.push(realProductId);
      }
    }
    await wishlist.save();
    const populatedWishlist = await wishlist.populate("products");
    res.status(201).json(populatedWishlist);
  } catch (err) {
    console.error("ADD TO WISHLIST ERROR:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/* ---------- Remove Product from Wishlist ---------- */
router.delete("/:productId", protect, async (req, res) => {
  const { productId } = req.params;
  try {
    const updatedWishlist = await Wishlist.findOneAndUpdate(
      { user: req.user._id },
      { $pull: { products: productId } },
      { new: true }
    ).populate("products");

    if (!updatedWishlist) {
      return res.status(404).json({ message: "Wishlist not found" });
    }
    res.json(updatedWishlist);
  } catch (err) {
    console.error("REMOVE FROM WISHLIST ERROR:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;