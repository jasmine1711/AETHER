import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  size: {
    type: String
  }
});

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    items: [cartItemSchema]
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for total price (depends on .populate("items.product"))
cartSchema.virtual("totalPrice").get(function() {
  if (!this.items) return 0;
  return this.items.reduce((total, item) => {
    // Check if product is populated and has a price
    return item.product?.price ? total + item.product.price * item.quantity : total;
  }, 0);
});

// Virtual for total item count
cartSchema.virtual("totalItems").get(function() {
  if (!this.items) return 0;
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

export default mongoose.model("Cart", cartSchema);