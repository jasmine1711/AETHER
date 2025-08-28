const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  name: String,
  price: Number,
  qty: Number,
  size: String,
  image: String,
});

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [orderItemSchema],
    shipping: {
      name: String,
      phone: String,
      address: String,
      city: String,
      pincode: String,
      state: String,
    },
    paymentProvider: { type: String, enum: ["razorpay", "stripe"], default: "razorpay" },
    paymentStatus: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
    paymentId: String,
    subtotal: Number,
    shippingFee: { type: Number, default: 0 },
    total: Number,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
