import mongoose from "mongoose"; // Changed from require to import

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
  },
  {
    timestamps: true,
  }
);

// This line was missing: You need to create the model from the schema
const Garment = mongoose.model("Garment", garmentSchema);

export default Garment; // Now this line correctly exports the model