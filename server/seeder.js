const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Product = require("./models/Product");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

// ✅ Always use slug format for categories
const allowedCategories = [
  "leather-jackets",
  "y2k-tops",
  "corset-tops",
  "denim-jeans",
  "handbags",
  "faux-leather-jackets",
];

// ✅ Normalize product (slug-safe + images + auto-thumbnail)
function normalizeProduct(product) {
  if (!product || typeof product !== "object") {
    throw new Error("❌ Invalid product object");
  }

  const { name, price, category, images = [], thumbnail } = product;

  if (!name) throw new Error("❌ Missing required field: name");
  if (price == null) throw new Error(`❌ Missing required field: price for ${name}`);
  if (!category) throw new Error(`❌ Missing required field: category for ${name}`);
  if (!Array.isArray(images) || images.length === 0) {
    throw new Error(`❌ Images missing for product: ${name}`);
  }

  let normalizedCategory = category;
  if (!allowedCategories.includes(normalizedCategory)) {
    console.warn(`⚠️ Invalid category "${category}", defaulting to "handbags"`);
    normalizedCategory = "handbags";
  }

  const normalizedImages = images.map((img) =>
    img.startsWith("/") ? img : `/${img}`
  );

  return {
    ...product,
    category: normalizedCategory,
    images: normalizedImages,
    thumbnail: thumbnail || normalizedImages[0],
  };
}

// ✅ Product data with category slugs
const products = [
  normalizeProduct({
    name: "Belted Faux Leather Long Coat",
    category: "faux-leather-jackets",
    brand: "Luxury Editions",
    price: 5199,
    condition: "New",
    images: [
      "/images/products/belted-faux-leather-long-coat/1.jpeg",
      "/images/products/belted-faux-leather-long-coat/2.jpeg",
      "/images/products/belted-faux-leather-long-coat/3.jpeg",
    ],
  }),
  normalizeProduct({
    name: "Black Polka Net Top",
    category: "y2k-tops",
    brand: "Trendy Wear",
    price: 1999,
    condition: "New",
    images: [
      "/images/products/black-polka-net-top/1.jpeg",
      "/images/products/black-polka-net-top/2.jpeg",
      "/images/products/black-polka-net-top/3.jpeg",
    ],
  }),
  normalizeProduct({
    name: "Blue Jean Corset",
    category: "corset-tops",
    brand: "Denim Luxe",
    price: 1499,
    condition: "New",
    images: [
      "/images/products/blue-jean-corset/1.jpeg",
      "/images/products/blue-jean-corset/2.jpeg",
    ],
  }),
  normalizeProduct({
    name: "Burgundy Halter Neck Corset Top",
    category: "corset-tops",
    brand: "Glam Studio",
    price: 1599,
    condition: "New",
    images: [
      "/images/products/burgundy-halter-neck-corset-top/1.jpeg",
      "/images/products/burgundy-halter-neck-corset-top/2.jpeg",
      "/images/products/burgundy-halter-neck-corset-top/3.jpeg",
    ],
    thumbnail: "/images/products/burgundy-halter-neck-corset-top/2.jpeg",
  }),
  normalizeProduct({
    name: "Cat Lover Corset Top",
    category: "corset-tops",
    brand: "Street Fashion",
    price: 1399,
    condition: "New",
    images: [
      "/images/products/cat-lover-corset-top/1.jpeg",
      "/images/products/cat-lover-corset-top/2.jpeg",
      "/images/products/cat-lover-corset-top/3.jpeg",
    ],
    thumbnail: "/images/products/cat-lover-corset-top/3.jpeg",
  }),
  normalizeProduct({
    name: "Dark Blue Classic Denim",
    category: "denim-jeans",
    brand: "Denim Luxe",
    price: 1999,
    condition: "New",
    images: [
      "/images/products/dark-blue-classic-denim/1.jpeg",
      "/images/products/dark-blue-classic-denim/2.jpeg",
      "/images/products/dark-blue-classic-denim/3.jpeg",
    ],
  }),
  normalizeProduct({
    name: "Embroidery Vintage Denim",
    category: "denim-jeans",
    brand: "Retro Threads",
    price: 2199,
    condition: "New",
    images: [
      "/images/products/embroidery-vintage-denim/1.jpeg",
      "/images/products/embroidery-vintage-denim/2.jpeg",
      "/images/products/embroidery-vintage-denim/3.jpeg",
    ],
  }),
  normalizeProduct({
    name: "Faux Leather Jacket",
    category: "faux-leather-jackets",
    brand: "Urban Edge",
    price: 2799,
    condition: "New",
    images: [
      "/images/products/faux-leather-jacket/1.jpeg",
      "/images/products/faux-leather-jacket/2.jpeg",
      "/images/products/faux-leather-jacket/4.jpeg",
      "/images/products/faux-leather-jacket/5.jpeg",
    ],
  }),
  normalizeProduct({
    name: "French Lantern Sleeves Corset",
    category: "corset-tops",
    brand: "Romantic Era",
    price: 1699,
    condition: "New",
    images: [
      "/images/products/french-lantern-sleeves-corset-top/1.jpeg",
      "/images/products/french-lantern-sleeves-corset-top/2.jpeg",
    ],
  }),
  normalizeProduct({
    name: "Gen-Z Touch Denim",
    category: "denim-jeans",
    brand: "Streetwear",
    price: 1899,
    condition: "New",
    images: [
      "/images/products/gen-z-touch-denim/1.jpeg",
      "/images/products/gen-z-touch-denim/2.jpeg",
    ],
  }),
  normalizeProduct({
    name: "Heart Shape Bell Bottom",
    category: "denim-jeans",
    brand: "Retro Luxe",
    price: 2099,
    condition: "New",
    images: [
      "/images/products/heart-shape-bell-bottom/1.jpeg",
      "/images/products/heart-shape-bell-bottom/2.jpeg",
      "/images/products/heart-shape-bell-bottom/3.jpeg",
    ],
  }),
  normalizeProduct({
    name: "HeartShape Leather Purse",
    category: "handbags",
    brand: "Luxury Editions",
    price: 2499,
    condition: "New",
    images: [
      "/images/products/heartshape-leather-purse/purse1.jpg",
      "/images/products/heartshape-leather-purse/purse2.jpg",
    ],
  }),
  normalizeProduct({
    name: "Patchwork Faux Leather Jacket",
    category: "leather-jackets",
    brand: "Designer Cuts",
    price: 2999,
    condition: "New",
    images: [
      "/images/products/patchwork-faux-leather-jacket/1.jpeg",
      "/images/products/patchwork-faux-leather-jacket/2.jpeg",
      "/images/products/patchwork-faux-leather-jacket/3.jpeg",
    ],
  }),
  normalizeProduct({
    name: "Puff Full-Sleeves Top",
    category: "y2k-tops",
    brand: "Trendy Wear",
    price: 1099,
    condition: "New",
    images: [
      "/images/products/puff-full-sleeves-top/1boe.jpeg",
      "/images/products/puff-full-sleeves-top/2boe.jpeg",
      "/images/products/puff-full-sleeves-top/3boe.jpeg",
    ],
  }),
  normalizeProduct({
    name: "Red Puff Sleeve Open Back Top",
    category: "y2k-tops",
    brand: "Trendy Wear",
    price: 1199,
    condition: "New",
    images: [
      "/images/products/red-puff-sleeve-open-back-top/1red.jpeg",
      "/images/products/red-puff-sleeve-open-back-top/2red.jpeg",
      "/images/products/red-puff-sleeve-open-back-top/3red.jpeg",
    ],
  }),
  normalizeProduct({
    name: "Ruffled Blouse with Bow Closure",
    category: "y2k-tops",
    brand: "Elegant Chic",
    price: 1299,
    condition: "New",
    images: [
      "/images/products/ruffled-blouse-with-bow-clouser/1white.jpeg",
      "/images/products/ruffled-blouse-with-bow-clouser/2white.jpeg",
      "/images/products/ruffled-blouse-with-bow-clouser/3white.jpeg",
    ],
  }),
  normalizeProduct({
    name: "White Handbag",
    category: "handbags",
    brand: "Luxury Editions",
    price: 2299,
    condition: "New",
    images: [
      "/images/products/white-handbag/handbag2.jpg",
      "/images/products/white-handbag/handbag3.webp",
      "/images/products/white-handbag/handbag4.webp",
    ],
  }),
  normalizeProduct({
    name: "White Polka Top",
    category: "y2k-tops",
    brand: "Trendy Wear",
    price: 999,
    condition: "New",
    images: [
      "/images/products/white-polka-top/1.jpeg",
      "/images/products/white-polka-top/2.jpeg",
      "/images/products/white-polka-top/3.jpeg",
    ],
  }),
  normalizeProduct({
    name: "Coach Tabby Bag Daisy Print",
    category: "handbags",
    brand: "Coach",
    price: 3999,
    condition: "New",
    images: [
      "/images/products/coach-tabby-bag-daisy-print-90s-trend.webp",
    ],
  }),
  normalizeProduct({
    name: "Messenger Bag",
    category: "handbags",
    brand: "Casual Carry",
    price: 1799,
    condition: "New",
    images: [
      "/images/products/messanger-bag.avif",
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
