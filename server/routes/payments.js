const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const { protect } = require("../middleware/authMiddleware");
const Order = require("../models/Order");

const router = express.Router();

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/* ------------------ Test Route ------------------ */
router.get("/test", (req, res) => {
  res.json({ message: "🚀 AETHER Payments API is live" });
});

/* ------------------ Create Razorpay Order ------------------ */
router.post("/razorpay/order", protect, async (req, res) => {
  try {
    const { items, shipping, subtotal, shippingFee, total } = req.body;

    console.log("Received order payload:", { items, shipping, subtotal, shippingFee, total });

    // Validate payload
    if (!items || !Array.isArray(items) || items.length === 0) {
      console.error("Invalid items array");
      return res.status(400).json({ success: false, message: "Invalid items data" });
    }
    if (!shipping || !shipping.address || !shipping.email) {
      console.error("Invalid shipping info");
      return res.status(400).json({ success: false, message: "Invalid shipping data" });
    }
    if (!total || Number(total) <= 0) {
      console.error("Invalid total amount");
      return res.status(400).json({ success: false, message: "Invalid total amount" });
    }

    // Create Razorpay order
    const options = {
      amount: Number(total) * 100, // Razorpay expects amount in paise
      currency: "INR",
      receipt: `aether_${Date.now()}`,
      notes: { userId: req.user._id.toString() },
    };

    const rzpOrder = await razorpay.orders.create(options);
    console.log("Razorpay order created:", rzpOrder);

    // Save order in MongoDB
    const newOrder = await Order.create({
      user: req.user._id,
      items,
      shipping,
      subtotal: Number(subtotal),
      shippingFee: Number(shippingFee),
      total: Number(total),
      paymentProvider: "razorpay",
      paymentStatus: "pending",
    });

    console.log("Order saved in DB:", newOrder._id);

    res.json({ success: true, razorpayOrder: rzpOrder, dbOrder: newOrder });
  } catch (err) {
    console.error("Order creation error:", err);
    res.status(500).json({ success: false, message: "Payment order creation failed", error: err.message });
  }
});

/* ------------------ Verify Razorpay Payment ------------------ */
router.post("/razorpay/verify", protect, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, dbOrderId } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !dbOrderId) {
      return res.status(400).json({ success: false, message: "Missing verification data" });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Signature mismatch" });
    }

    const order = await Order.findById(dbOrderId);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    order.paymentStatus = "paid";
    order.paymentId = razorpay_payment_id;
    await order.save();

    res.json({ success: true, message: "Payment verified", order });
  } catch (err) {
    console.error("Payment verify error:", err);
    res.status(500).json({ success: false, message: "Payment verification failed", error: err.message });
  }
});

/* ------------------ Get User Orders ------------------ */
router.get("/my-orders", protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).populate("items.product");
    res.json({ success: true, orders });
  } catch (err) {
    console.error("Fetch orders error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch orders", error: err.message });
  }
});

module.exports = router;
