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
    type: String, 
    required: true 
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
    toJSON: { virtuals: true }, // Ensure virtuals are included when converting to JSON
    toObject: { virtuals: true } // Ensure virtuals are included when converting to objects
  }
);

// Calculate total price virtual
cartSchema.virtual('totalPrice').get(function() {
  // If items are populated with product data
  if (this.items.length > 0 && this.items[0].product && this.items[0].product.price) {
    return this.items.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0);
  }
  
  // Fallback if items aren't populated (just return 0 or handle differently)
  return 0;
});

// Calculate total items count virtual
cartSchema.virtual('totalItems').get(function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

module.exports = mongoose.model("Cart", cartSchema);