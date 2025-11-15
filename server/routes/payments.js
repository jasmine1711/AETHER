// routes/payments.js
import express from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import { protect } from "../middleware/authMiddleware.js";
import Order from "../models/Order.js";

const router = express.Router();

// ----- Lazy Razorpay Initialization -----
let razorpay = null;

function getRazorpay() {
  if (!razorpay) {
    if (process.env.RAZORPAY_KEY_ID?.trim() && process.env.RAZORPAY_KEY_SECRET?.trim()) {
      razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID.trim(),
        key_secret: process.env.RAZORPAY_KEY_SECRET.trim(),
      });
      console.log("✅ Razorpay initialized successfully");
    } else {
      console.warn("⚠️ Razorpay keys missing! Payment routes disabled.");
      return null;
    }
  }
  return razorpay;
}

// ----- Test Route -----
router.get("/test", (req, res) => {
  const rzp = getRazorpay();
  res.json({
    message: "🚀 Payments API is live",
    razorpayConfigured: !!rzp,
    key: process.env.RAZORPAY_KEY_ID || null,
  });
});

// ----- Create Razorpay Order -----
router.post("/razorpay/order", protect, async (req, res) => {
  try {
    const rzp = getRazorpay();
    if (!rzp) return res.status(500).json({ success: false, message: "Payment gateway not configured" });

    const { items, shipping, subtotal, shippingFee, total } = req.body;
    const userId = req.user?._id || null;
    const email = shipping?.email || "guest@example.com";

    const options = {
      amount: Math.round(Number(total) * 100), // paisa
      currency: "INR",
      receipt: `aether_${Date.now()}`,
      notes: { userId: userId || "guest", email },
    };

    const rzpOrder = await rzp.orders.create(options);

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

// ----- ✨ NEW: Create COD Order -----
router.post("/cod/order", protect, async (req, res) => {
  try {
    const { items, shipping, subtotal, shippingFee, total } = req.body;

    // Create the order in our database
    const newOrder = await Order.create({
    _user: req.user._id,
      items,
      shipping,
      subtotal: Number(subtotal),
      shippingFee: Number(shippingFee),
      total: Number(total),
      paymentProvider: "cod", // Set provider to "cod"
      paymentStatus: "pending", // Set status to "pending"
    });

    res.status(201).json({ success: true, order: newOrder });
  
  } catch (err) {
    console.error("COD Order creation error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to create COD order",
      error: err.message,
    });
  }
});
// ----- END NEW COD ROUTE -----

// ----- Verify Razorpay Payment -----
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

// ----- Get User Orders -----
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

export default router;
