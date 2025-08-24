const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    name: String,
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: String,
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    brand: { type: String, default: 'ÆTHER' },
    category: { type: String, enum: ['Clothing', 'Footwear', 'Shoes'], required: true },
    price: { type: Number, required: true },
    stock: { type: Number, default: 10 },
    images: [{ type: String }],
    sizes: [{ type: String }],           // e.g. ["S","M","L","UK7","UK8"]
    isThrifted: { type: Boolean, default: true },
    condition: { type: String, default: 'Good' }, // Excellent/Good/Fair
    description: { type: String, default: '' },
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    reviews: [reviewSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
