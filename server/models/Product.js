import mongoose from "mongoose";
import slugify from "slugify";

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
    slug: {
      type: String,
      unique: true,
      index: true,
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
      min: [0, "Price must be positive"],
      max: [100000, "Price cannot exceed 100,000"],
    },
    condition: {
      type: String,
      required: true,
      enum: ["New", "Used"],
      default: "New",
    },

    /* ---------------- Images & Thumbnail ---------------- */
    images: {
      type: [String],
      required: true,
      default: ["/images/default.jpg"], // ✅ fallback so frontend always gets an array
    },
    thumbnail: {
      type: String,
      required: true,
      default: "/images/default-thumb.jpg", // ✅ fallback
    },

    /* ---------------- Description & Sizes ---------------- */
    description: {
      type: String,
      required: true,
      maxLength: [1000, "Description cannot exceed 1000 characters"],
    },
    sizes: {
      type: [String],
      required: true,
      enum: ["XS", "S", "M", "L", "XL", "XXL", "One Size"],
      default: ["One Size"], // ✅ ensures array always exists
    },

    stock: {
      type: Number,
      required: true,
      min: [0, "Stock cannot be negative"],
      default: 0,
    },
    badge: {
      type: String,
      enum: ["New", "Popular", "Sale", "Bestseller", ""],
      default: "",
    },
    tags: {
      type: [String],
      default: [],
    },

    reviews: [reviewSchema],
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/* ---------------- Indexes ---------------- */
productSchema.index({ category: 1, price: 1 });
productSchema.index({ name: "text", description: "text" });

/* ---------------- Slug Middleware ---------------- */
productSchema.pre("save", async function (next) {
  if (this.isModified("name")) {
    let baseSlug = slugify(this.name, { lower: true, strict: true });
    let slug = baseSlug;
    let counter = 1;

    while (await this.constructor.findOne({ slug, _id: { $ne: this._id } })) {
      slug = `${baseSlug}-${counter++}`;
    }
    this.slug = slug;
  }
  next();
});

/* ---------------- Virtuals ---------------- */
productSchema.virtual("formattedPrice").get(function () {
  return `₹${this.price.toLocaleString("en-IN")}`;
});

/* ---------------- Statics & Methods ---------------- */
productSchema.statics.findByCategory = function (category, excludeId = null) {
  const query = excludeId
    ? { category, _id: { $ne: excludeId } }
    : { category };
  return this.find(query).limit(10); // ✅ safe default
};

productSchema.methods.isInStock = function () {
  return this.stock > 0;
};

/* ---------------- Hooks for reviews ---------------- */
// Keep rating & numReviews in sync automatically
productSchema.post("save", async function (doc, next) {
  if (doc.reviews?.length > 0) {
    doc.numReviews = doc.reviews.length;
    doc.rating =
      doc.reviews.reduce((acc, r) => acc + r.rating, 0) / doc.reviews.length;
  } else {
    doc.numReviews = 0;
    doc.rating = 0;
  }
  await doc.constructor.findByIdAndUpdate(doc._id, {
    rating: doc.rating,
    numReviews: doc.numReviews,
  });
  next();
});

const Product = mongoose.model("Product", productSchema);
export default Product;
