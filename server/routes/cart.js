const express = require("express");
const { body, validationResult } = require("express-validator");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

/* ---------- Get User Cart ---------- */
router.get("/", protect, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
    if (!cart) return res.json({ items: [] });
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
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
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { productId, quantity, size } = req.body;

    try {
      const product = await Product.findById(productId);
      if (!product) return res.status(404).json({ message: "Product not found" });

      let cart = await Cart.findOne({ user: req.user._id });
      if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });

      const existingItem = cart.items.find(
        (item) => item.product.toString() === productId && item.size === size
      );

      if (existingItem) existingItem.quantity += quantity;
      else cart.items.push({ product: productId, quantity, size });

      await cart.save();
      const populatedCart = await cart.populate("items.product");
      res.status(201).json(populatedCart);
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
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
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const cart = await Cart.findOne({ user: req.user._id });
      if (!cart) return res.status(404).json({ message: "Cart not found" });

      const item = cart.items.id(req.params.itemId);
      if (!item) return res.status(404).json({ message: "Item not found" });

      item.quantity = req.body.quantity;
      await cart.save();

      const populatedCart = await cart.populate("items.product");
      res.json(populatedCart);
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  }
);

/* ---------- Remove Item from Cart ---------- */
router.delete("/item/:itemId", protect, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items.id(req.params.itemId)?.remove();
    await cart.save();

    const populatedCart = await cart.populate("items.product");
    res.json(populatedCart);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
