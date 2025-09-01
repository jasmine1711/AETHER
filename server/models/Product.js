const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxLength: [100, "Product name cannot exceed 100 characters"],
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
        "Faux Leather",
      ],
      index: true,
    },
    brand: {
      type: String,
      required: [true, "Brand is required"],
      trim: true,
      maxLength: [50, "Brand name cannot exceed 50 characters"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price must be a positive number"],
      max: [100000, "Price cannot exceed 100,000"],
    },
    condition: {
      type: String,
      required: [true, "Condition is required"],
      enum: ["New", "Used"],
      default: "New",
    },
    images: {
      type: [String],
      required: [true, "At least one image is required"],
      validate: {
        validator: (arr) => arr.length > 0,
        message: "At least one image must be provided",
      },
    },
    thumbnail: {
      type: String,
      required: [true, "Thumbnail image is required"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      maxLength: [1000, "Description cannot exceed 1000 characters"],
    },
    sizes: {
      type: [String],
      required: [true, "At least one size must be specified"],
      enum: ["XS", "S", "M", "L", "XL", "XXL", "One Size"],
    },
    stock: {
      type: Number,
      required: [true, "Stock quantity is required"],
      min: [0, "Stock cannot be negative"],
      default: 0,
    },
    badge: {
      type: String,
      enum: ["New", "Popular", "Sale", "Bestseller", ""],
      default: "",
    },
    tags: [String],
    reviews: [reviewSchema],

    // ✅ rating + numReviews
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

productSchema.index({ category: 1, price: 1 });
productSchema.index({ name: "text", description: "text" });

productSchema.virtual("formattedPrice").get(function () {
  return `₹${this.price.toLocaleString("en-IN")}`;
});

productSchema.statics.findByCategory = function (category) {
  return this.find({ category });
};

productSchema.methods.isInStock = function () {
  return this.stock > 0;
};

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
