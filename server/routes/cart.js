import express from "express";
import { body, validationResult } from "express-validator";
import mongoose from "mongoose";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ---------- Get User Cart ---------- */
router.get("/", protect, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id })
      .populate("items.product")
      .exec();

    if (!cart) {
      return res.json({ user: req.user._id, items: [] });
    }
    res.json(cart);
  } catch (err) {
    console.error("GET CART ERROR:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

/* ---------- Add Item to Cart ---------- */
router.post(
  "/",
  protect,
  [
    body("productId", "Product ID is required").notEmpty(),
    body("quantity", "Quantity must be a positive number").isInt({ min: 1 }),
    body("size").optional().isString(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { productId, quantity, size } = req.body;

    try {
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      let cart = await Cart.findOne({ user: req.user._id });
      if (!cart) {
        cart = await Cart.create({ user: req.user._id, items: [] });
      }

      const existingItem = cart.items.find(
        (item) =>
          item.product.toString() === product._id.toString() &&
          item.size === size
      );

      if (existingItem) {
        existingItem.quantity += parseInt(quantity, 10);
      } else {
        cart.items.push({ product: product._id, quantity, size });
      }

      await cart.save();

      const populatedCart = await Cart.findById(cart._id)
        .populate("items.product")
        .exec();

      res.status(201).json(populatedCart);
    } catch (err) {
      console.error("ADD TO CART ERROR:", err);
      res.status(500).json({ message: "Server Error", error: err.message });
    }
  }
);

/* ---------- Update Cart Item Quantity ---------- */
router.put(
  "/item/:itemId",
  protect,
  [body("quantity", "Quantity must be a positive number").isInt({ min: 1 })],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const cart = await Cart.findOne({ user: req.user._id });
      if (!cart) return res.status(404).json({ message: "Cart not found" });

      const item = cart.items.id(req.params.itemId);
      if (!item) return res.status(404).json({ message: "Item not found" });

      item.quantity = parseInt(req.body.quantity, 10);
      await cart.save();

      const populatedCart = await Cart.findById(cart._id)
        .populate("items.product")
        .exec();

      res.json(populatedCart);
    } catch (err)      {
      console.error("UPDATE CART ERROR:", err);
      res.status(500).json({ message: "Server Error", error: err.message });
    }
  }
);

/* ---------- ✨ NEW: Remove a Single Item from Cart ---------- */
// This route is for the removeFromCart() function on the frontend.
router.delete("/item/:itemId", protect, async (req, res) => {
  try {
    const cart = await Cart.findOneAndUpdate(
      { user: req.user._id },
      { $pull: { items: { _id: req.params.itemId } } },
      { new: true }
    ).populate("items.product");

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }
    
    res.json(cart);
  } catch (err) {
    console.error("REMOVE FROM CART ERROR:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});


/* ---------- ✅ FIX: Clear All Items from Cart ---------- */
// This route is for the clearCart() function and now correctly matches the frontend.
router.delete("/", protect, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = []; // Clear the items array
      await cart.save();
    }
    // Return an empty cart structure
    res.json({ user: req.user._id, items: [] });
  } catch (err) {
    console.error("CLEAR CART ERROR:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

export default router;