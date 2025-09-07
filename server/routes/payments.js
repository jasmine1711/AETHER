const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const { protect } = require("../middleware/authMiddleware");
const Order = require("../models/Order");

const router = express.Router();

// Initialize Razorpay
let razorpay;
try {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
  console.log("✅ Razorpay initialized successfully");
} catch (error) {
  console.error("❌ Razorpay initialization failed:", error.message);
}

// Test route
router.get("/test", (req, res) => {
  res.json({
    message: "🚀 Payments API is live",
    port: process.env.PORT || 5000,
    razorpayConfigured: !!razorpay,
    key: process.env.RAZORPAY_KEY_ID,
  });
});

/* ------------------ Create Razorpay Order ------------------ */
router.post("/razorpay/order", async (req, res) => {
  try {
    if (!razorpay) {
      return res.status(500).json({
        success: false,
        message: "Payment gateway not configured",
      });
    }

    const { items, shipping, subtotal, shippingFee, total } = req.body;

    // Allow guest or logged-in user
    let userId = null;
    let email = shipping.email;
    const token = req.headers.authorization?.split(" ")[1];
    if (token && req.user?._id) {
      userId = req.user._id.toString();
    }

    const options = {
      amount: Math.round(Number(total) * 100), // amount in paisa
      currency: "INR",
      receipt: `aether_${Date.now()}`,
      notes: { userId: userId || "guest", email },
    };

    const rzpOrder = await razorpay.orders.create(options);

    const newOrder = await Order.create({
      user: userId,
      items,
      shipping,
      subtotal: Number(subtotal),
      shippingFee: Number(shippingFee),
      total: Number(total),
      paymentProvider: "razorpay",
      paymentStatus: "pending",
      razorpayOrderId: rzpOrder.id,
    });

    res.json({
      success: true,
      razorpayOrder: rzpOrder,
      dbOrder: newOrder,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error("Order creation error:", err);
    res.status(500).json({
      success: false,
      message: "Payment order creation failed",
      error: process.env.NODE_ENV === "development" ? err.message : "Internal server error",
    });
  }
});

/* ------------------ Verify Razorpay Payment ------------------ */
router.post("/razorpay/verify", async (req, res) => {
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
    order.razorpaySignature = razorpay_signature;
    await order.save();

    res.json({ success: true, message: "Payment verified", order });
  } catch (err) {
    console.error("Payment verify error:", err);
    res.status(500).json({
      success: false,
      message: "Payment verification failed",
      error: process.env.NODE_ENV === "development" ? err.message : "Internal server error",
    });
  }
});

/* ------------------ Get User Orders ------------------ */
router.get("/my-orders", protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).populate("items.product");
    res.json({ success: true, orders });
  } catch (err) {
    console.error("Fetch orders error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: process.env.NODE_ENV === "development" ? err.message : "Internal server error",
    });
  }
});

module.exports = router;
