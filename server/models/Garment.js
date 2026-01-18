import mongoose from "mongoose";

const garmentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    name: {
      type: String,
      required: [true, "Please enter a name for your garment."],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Please select a category."],
      enum: [
        "Top", "T-Shirt", "Blouse", "Sweater", "Hoodie", "Jacket", "Coat",
        "Dress", "Jumpsuit", "Bottom", "Pants", "Jeans", "Skirt", "Shorts",
        "Shoes", "Sneakers", "Boots", "Heels", "Flats", "Accessory", "Bag",
        "Belt", "Jewelry", "Hat", "Scarf",
      ],
    },
    color: {
      type: String,
      trim: true,
    },
    style: {
      type: String,
      enum: [
        '90s Grunge', 'Y2K', 'Vintage Prep', 'Cottagecore',
        'Dark Academia', 'Light Academia', 'E-Girl', 'Soft Grunge',
        'Art Hoe', 'Baddie', 'Minimalist', 'Bohemian', 'Streetwear',
        'Goth', 'Punk', 'Skater', 'Retro Futurism', 'Formal', 'Casual'
      ]
    },
    imageUrl: {
      type: String,
      required: true,
    },
    imagePublicId: {
      type: String,
      required: true,
    },
    season: {
      type: [String],
      enum: ['Spring', 'Summer', 'Fall', 'Winter'],
      default: []
    },
    formality: {
      type: String,
      enum: ['Casual', 'Smart Casual', 'Business Casual', 'Business', 'Formal'],
      default: 'Casual'
    },
    isFavorite: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
garmentSchema.index({ user: 1, category: 1 });
garmentSchema.index({ user: 1, style: 1 });

const Garment = mongoose.model("Garment", garmentSchema);

export default Garment;