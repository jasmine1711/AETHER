const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const { protect } = require("../middleware/authMiddleware");
const Order = require("../models/Order");

const router = express.Router();


// Initialize Razorpay with ENV keys
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

    // Create Razorpay order
    const options = {
      amount: total * 100, // paise
      currency: "INR",
      receipt: `aether_${Date.now()}`,
      notes: { userId: req.user._id.toString() },
    };

    const rzpOrder = await razorpay.orders.create(options);

    // Save order in MongoDB
    const newOrder = await Order.create({
      user: req.user._id,
      items,
      shipping,
      subtotal,
      shippingFee,
      total,
      paymentProvider: "razorpay",
      paymentStatus: "pending",
    });

    res.json({ success: true, razorpayOrder: rzpOrder, dbOrder: newOrder });
  } catch (err) {
    console.error("Order creation error:", err);
    res.status(500).json({ success: false, message: "Payment order creation failed" });
  }
});

/* ------------------ Verify Payment ------------------ */
router.post("/razorpay/verify", protect, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Signature mismatch" });
    }

    // Update DB order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    order.paymentStatus = "paid";
    order.paymentId = razorpay_payment_id;
    await order.save();

    res.json({ success: true, message: "Payment verified", order });
  } catch (err) {
    console.error("Payment verify error:", err);
    res.status(500).json({ success: false, message: "Payment verification failed" });
  }
});

/* ------------------ Get User Orders ------------------ */
router.get("/my-orders", protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).populate("items.product");
    res.json(orders);
  } catch (err) {
    console.error("Fetch orders error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch orders" });
  }
});

module.exports = router;
