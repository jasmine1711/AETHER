const mongoose = require("mongoose");

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

// Virtual for total price
cartSchema.virtual('totalPrice').get(function() {
  if (this.items.length > 0 && this.items[0].product && this.items[0].product.price) {
    return this.items.reduce((total, item) => total + item.product.price * item.quantity, 0);
  }
  return 0;
});

// Virtual for total items
cartSchema.virtual('totalItems').get(function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

module.exports = mongoose.model("Cart", cartSchema);
