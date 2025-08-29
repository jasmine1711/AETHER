// backend/seeder.js
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Product = require("./models/Product");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

// ✅ Allowed categories (must match schema exactly)
const allowedCategories = [
  "Leather Jacket",
  "Y2K Era Tops",
  "Corset Top",
  "Denim Jeans",
  "Handbags",
  "Faux Leather Jacket",
];

// ✅ Normalize product (enforces rules & auto-thumbnail)
function normalizeProduct(product) {
  if (!product.name || !product.price || !product.category) {
    throw new Error(`❌ Missing required field in product: ${product.name}`);
  }
  if (!allowedCategories.includes(product.category)) {
    throw new Error(`❌ Invalid category for product: ${product.name}`);
  }

  if (!product.images || !Array.isArray(product.images) || product.images.length === 0) {
    throw new Error(`❌ Images missing for product: ${product.name}`);
  }

  return {
    ...product,
    images: product.images.map((img) =>
      img.startsWith("/") ? img : `/${img}`
    ),
    thumbnail: product.thumbnail || product.images[0], // ✅ Auto fallback
  };
}

// ✅ Product data
const products = [
  normalizeProduct({
    name: "Belted Faux Leather Long Coat",
    category: "Faux Leather Jacket",
    brand: "Luxury Editions",
    price: 3499,
    condition: "New",
    images: [
      "/images/products/Belted Faux Leather Long Coat/1.jpeg",
      "/images/products/Belted Faux Leather Long Coat/2.jpeg",
      "/images/products/Belted Faux Leather Long Coat/3.jpeg",
    ],
  }),
  normalizeProduct({
    name: "Black Polka Net Top",
    category: "Y2K Era Tops",
    brand: "Trendy Wear",
    price: 999,
    condition: "New",
    images: [
      "/images/products/Black Polka net top/1.jpeg",
      "/images/products/Black Polka net top/2.jpeg",
      "/images/products/Black Polka net top/3.jpeg",
    ],
  }),
  normalizeProduct({
    name: "Blue Jean Corset",
    category: "Corset Top",
    brand: "Denim Luxe",
    price: 1499,
    condition: "New",
    images: [
      "/images/products/Blue Jean Corset/1.jpeg",
      "/images/products/Blue Jean Corset/WhatsApp Image 2025-08-27.jpeg",
    ],
  }),
  normalizeProduct({
    name: "Burgundy Halter Neck Corset Top",
    category: "Corset Top",
    brand: "Glam Studio",
    price: 1599,
    condition: "New",
    images: [
      "/images/products/Burgundy Halter Neck Corset Top/1.jpeg",
      "/images/products/Burgundy Halter Neck Corset Top/2.jpeg",
      "/images/products/Burgundy Halter Neck Corset Top/3.jpeg",
    ],
    thumbnail: "/images/products/Burgundy Halter Neck Corset Top/2.jpeg", // ✅ Custom
  }),
  normalizeProduct({
    name: "Cat Lover Corset Top",
    category: "Corset Top",
    brand: "Street Fashion",
    price: 1399,
    condition: "New",
    images: [
      "/images/products/Cat Lover Corset Top/1.jpeg",
      "/images/products/Cat Lover Corset Top/2.jpeg",
      "/images/products/Cat Lover Corset Top/3.jpeg",
    ],
    thumbnail: "/images/products/Cat Lover Corset Top/3.jpeg", // ✅ Custom
  }),
  normalizeProduct({
    name: "Dark Blue Classic Denim",
    category: "Denim Jeans",
    brand: "Denim Luxe",
    price: 1999,
    condition: "New",
    images: [
      "/images/products/Dark Blue Classic Denim/1.jpeg",
      "/images/products/Dark Blue Classic Denim/2.jpeg",
      "/images/products/Dark Blue Classic Denim/3.jpeg",
    ],
  }),
  normalizeProduct({
    name: "Embroidery Vintage Denim",
    category: "Denim Jeans",
    brand: "Retro Threads",
    price: 2199,
    condition: "New",
    images: [
      "/images/products/Embroidery Vintage Denim/1.jpeg",
      "/images/products/Embroidery Vintage Denim/2.jpeg",
      "/images/products/Embroidery Vintage Denim/3.jpeg",
    ],
  }),
  normalizeProduct({
    name: "Faux Leather Jacket",
    category: "Faux Leather Jacket",
    brand: "Urban Edge",
    price: 2799,
    condition: "New",
    images: [
      "/images/products/Faux Leather Jacket/1.jpeg",
      "/images/products/Faux Leather Jacket/2.jpeg",
      "/images/products/Faux Leather Jacket/4.jpeg",
      "/images/products/Faux Leather Jacket/WhatsApp Image 2025-08-27.jpeg",
    ],
  }),
  normalizeProduct({
    name: "French Lantern Sleeves Corset",
    category: "Corset Top",
    brand: "Romantic Era",
    price: 1699,
    condition: "New",
    images: [
      "/images/products/French Lantern Sleeves Corset/1.jpeg",
      "/images/products/French Lantern Sleeves Corset/2.jpeg",
    ],
  }),
  normalizeProduct({
    name: "Gen-Z Touch Denim",
    category: "Denim Jeans",
    brand: "Streetwear",
    price: 1899,
    condition: "New",
    images: [
      "/images/products/Gen-z Touch Denim/1.jpeg",
      "/images/products/Gen-z Touch Denim/2.jpeg",
    ],
  }),
  normalizeProduct({
    name: "Heart Shape Bell Bottom",
    category: "Denim Jeans",
    brand: "Retro Luxe",
    price: 2099,
    condition: "New",
    images: [
      "/images/products/Heart Shape Bell Bottom/1.jpeg",
      "/images/products/Heart Shape Bell Bottom/2.jpeg",
      "/images/products/Heart Shape Bell Bottom/3.jpeg",
    ],
  }),
  normalizeProduct({
    name: "HeartShape Leather Purse",
    category: "Handbags",
    brand: "Luxury Editions",
    price: 2499,
    condition: "New",
    images: [
      "/images/products/HeartShape Leather Purse/purse 2.jpg",
      "/images/products/HeartShape Leather Purse/purse.jpg",
    ],
  }),
  normalizeProduct({
    name: "Patchwork Faux Leather Jacket",
    category: "Faux Leather Jacket",
    brand: "Designer Cuts",
    price: 2999,
    condition: "New",
    images: [
      "/images/products/Patchwork Faux Leather Jacket/1.jpeg",
      "/images/products/Patchwork Faux Leather Jacket/2.jpeg",
      "/images/products/Patchwork Faux Leather Jacket/3.jpeg",
    ],
  }),
  normalizeProduct({
    name: "Puff Full-Sleeves Top",
    category: "Y2K Era Tops",
    brand: "Trendy Wear",
    price: 1099,
    condition: "New",
    images: [
      "/images/products/puff full-sleeves top/1boe.jpeg",
      "/images/products/puff full-sleeves top/2boe.jpeg",
      "/images/products/puff full-sleeves top/3boe.jpeg",
    ],
  }),
  normalizeProduct({
    name: "Red Puff Sleeve Open Back Top",
    category: "Y2K Era Tops",
    brand: "Trendy Wear",
    price: 1199,
    condition: "New",
    images: [
      "/images/products/Red puff sleeve open back top/1red.jpeg",
      "/images/products/Red puff sleeve open back top/2red.jpeg",
      "/images/products/Red puff sleeve open back top/3red.jpeg",
    ],
  }),
  normalizeProduct({
    name: "Ruffled Blouse with Bow Closure",
    category: "Y2K Era Tops",
    brand: "Elegant Chic",
    price: 1299,
    condition: "New",
    images: [
      "/images/products/Ruffled Blouse with bow clouser/1white.jpeg",
      "/images/products/Ruffled Blouse with bow clouser/2white.jpeg",
      "/images/products/Ruffled Blouse with bow clouser/3white.jpeg",
    ],
  }),
  normalizeProduct({
    name: "White Handbag",
    category: "Handbags",
    brand: "Luxury Editions",
    price: 2299,
    condition: "New",
    images: [
      "/images/products/White Handbag/handbag2.jpg",
      "/images/products/White Handbag/handbag3.webp",
      "/images/products/White Handbag/handbag4.webp",
    ],
  }),
  normalizeProduct({
    name: "White Polka Top",
    category: "Y2K Era Tops",
    brand: "Trendy Wear",
    price: 999,
    condition: "New",
    images: [
      "/images/products/White Polka top/1.jpeg",
      "/images/products/White Polka top/2.jpeg",
      "/images/products/White Polka top/3.jpeg",
    ],
  }),
  normalizeProduct({
    name: "Coach Tabby Bag Daisy Print",
    category: "Handbags",
    brand: "Coach",
    price: 3999,
    condition: "New",
    images: [
      "/images/products/Coach-Tabby-Bag-Daisy-Print/1.jpeg",
    ],
  }),
  normalizeProduct({
    name: "Messenger Bag",
    category: "Handbags",
    brand: "Casual Carry",
    price: 1799,
    condition: "New",
    images: [
      "/images/products/messanger bag.avif",
    ],
  }),
];

// ✅ Import/Destroy functions
const importData = async () => {
  try {
    await Product.deleteMany();
    await Product.insertMany(products);
    console.log("✅ Data Imported!");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await Product.deleteMany();
    console.log("🗑️ Data Destroyed!");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

if (process.argv[2] === "-d") {
  destroyData();
} else {
  importData();
}
