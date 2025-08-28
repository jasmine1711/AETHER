// backend/models/Product.js
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: [
        "leather jacket",
        "y2k era tops",
        "corset top",
        "denim jeans",
        "handbags",
        "faux leather jacket",
      ],
    },
    brand: {
      type: String,
      default: "Aether",
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price must be a positive number"],
    },
    condition: {
      type: String,
      enum: ["New", "Used"],
      default: "New",
    },
    images: {
      type: [String],
      required: [true, "At least one image is required"],
      validate: {
        validator: function (arr) {
          return arr.length > 0;
        },
        message: "At least one image URL must be provided",
      },
    },
    thumbnail: {
      type: String,
      required: [true, "Thumbnail image is required"],
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
