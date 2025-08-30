// server/models/Product.js
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxLength: [100, "Product name cannot exceed 100 characters"]
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: [
        "Leather Jackets",
        "Y2K Tops",
        "Corset Tops",
        "Denim Jeans",
        "Handbags",
        "Faux Leather"
      ],
      index: true
    },
    brand: {
      type: String,
      required: [true, "Brand is required"],
      trim: true,
      maxLength: [50, "Brand name cannot exceed 50 characters"]
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price must be a positive number"],
      max: [100000, "Price cannot exceed 100,000"]
    },
    condition: {
      type: String,
      required: [true, "Condition is required"],
      enum: ["New", "Used"],
      default: "New"
    },
    images: {
      type: [String],
      required: [true, "At least one image is required"],
      validate: {
        validator: function(arr) {
          return arr.length > 0;
        },
        message: "At least one image must be provided"
      }
    },
    thumbnail: {
      type: String,
      required: [true, "Thumbnail image is required"]
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      maxLength: [1000, "Description cannot exceed 1000 characters"]
    },
    sizes: {
      type: [String],
      required: [true, "At least one size must be specified"],
      enum: ["XS", "S", "M", "L", "XL", "XXL", "One Size"]
    },
    stock: {
      type: Number,
      required: [true, "Stock quantity is required"],
      min: [0, "Stock cannot be negative"],
      default: 0
    },
    badge: {
      type: String,
      enum: ["New", "Popular", "Sale", "Bestseller", ""],
      default: ""
    },
    tags: [String]
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Index for better query performance
productSchema.index({ category: 1, price: 1 });
productSchema.index({ name: "text", description: "text" });

// Virtual for formatted price
productSchema.virtual("formattedPrice").get(function() {
  return `₹${this.price.toLocaleString("en-IN")}`;
});

// Static method to get products by category
productSchema.statics.findByCategory = function(category) {
  return this.find({ category });
};

// Instance method to check if product is in stock
productSchema.methods.isInStock = function() {
  return this.stock > 0;
};

const Product = mongoose.model("Product", productSchema);

module.exports = Product;