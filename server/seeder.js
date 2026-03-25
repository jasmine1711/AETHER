// server/seeder.js - Fixed with proper slug generation
import mongoose from "mongoose";
import dotenv from "dotenv";
import slugify from "slugify";
import Product from "./models/Product.js";

dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
    process.exit(1);
  }
};

// ✅ Function to generate slug from name
const generateSlug = (name, existingSlugs = new Set()) => {
  let baseSlug = slugify(name, { 
    lower: true, 
    strict: true,
    remove: /[*+~.()'"!:@]/g 
  });
  
  let slug = baseSlug;
  let counter = 1;
  
  // Ensure uniqueness
  while (existingSlugs.has(slug)) {
    slug = `${baseSlug}-${counter++}`;
  }
  existingSlugs.add(slug);
  
  return slug;
};

// ✅ Always use slug format for categories
const allowedCategories = [
  "leather-jackets",
  "y2k-tops",
  "corset-tops",
  "denim-jeans",
  "handbags",
  "faux-leather-jackets",
];

// ✅ Normalize product with slug generation
function normalizeProduct(product, index, existingSlugs) {
  if (!product || typeof product !== "object") {
    throw new Error("❌ Invalid product object");
  }

  const { name, price, category, images = [], thumbnail, brand, condition, sizes, stock, description, badge } = product;

  if (!name) throw new Error(`❌ Missing required field: name`);
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

  // Map category to match enum in Product model
  const categoryMapping = {
    "leather-jackets": "Leather Jackets",
    "y2k-tops": "Y2K Tops",
    "corset-tops": "Corset Tops",
    "denim-jeans": "Denim Jeans",
    "handbags": "Handbags",
    "faux-leather-jackets": "Faux Leather"
  };

  // ✅ Generate slug for this product
  const slug = generateSlug(name, existingSlugs);

  return {
    name,
    slug, // ✅ Add generated slug
    brand: brand || "Aether",
    price: Number(price),
    condition: condition || "New",
    images: normalizedImages,
    thumbnail: thumbnail || normalizedImages[0],
    category: categoryMapping[normalizedCategory] || normalizedCategory,
    description: description || `Beautiful ${name} from Aether collection. Perfect for any occasion.`,
    sizes: sizes || ["S", "M", "L"],
    stock: stock || 10,
    badge: badge || "",
    tags: [normalizedCategory],
  };
}

// ✅ Product data with category slugs
const getProductsWithSlugs = () => {
  const existingSlugs = new Set();
  const products = [
    {
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
      sizes: ["S", "M", "L", "XL"],
      stock: 15,
      badge: "New",
      description: "Elegant belted faux leather long coat perfect for winter. Made with premium quality material for ultimate comfort and style."
    },
    {
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
      sizes: ["XS", "S", "M", "L"],
      stock: 25,
      badge: "Popular",
      description: "Stylish black polka dot net top perfect for parties and casual outings."
    },
    {
      name: "Blue Jean Corset",
      category: "corset-tops",
      brand: "Denim Luxe",
      price: 1499,
      condition: "New",
      images: [
        "/images/products/blue-jean-corset/1.jpeg",
        "/images/products/blue-jean-corset/2.jpeg",
      ],
      sizes: ["S", "M", "L"],
      stock: 20,
      description: "Trendy blue jean corset top that shapes your silhouette and adds a retro vibe."
    },
    {
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
      sizes: ["S", "M", "L", "XL"],
      stock: 18,
      description: "Elegant burgundy halter neck corset top for special occasions and nights out."
    },
    {
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
      sizes: ["XS", "S", "M"],
      stock: 30,
      description: "Fun and playful cat lover corset top for casual wear and pet lovers."
    },
    {
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
      sizes: ["28", "30", "32", "34", "36"],
      stock: 40,
      description: "Classic dark blue denim jeans that never go out of style. Perfect fit and comfort."
    },
    {
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
      sizes: ["28", "30", "32", "34"],
      stock: 25,
      badge: "Bestseller",
      description: "Vintage style denim with beautiful embroidery details. Stand out from the crowd."
    },
    {
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
      sizes: ["S", "M", "L", "XL", "XXL"],
      stock: 20,
      badge: "Popular",
      description: "Classic faux leather jacket for an edgy look. Versatile and stylish."
    },
    {
      name: "French Lantern Sleeves Corset",
      category: "corset-tops",
      brand: "Romantic Era",
      price: 1699,
      condition: "New",
      images: [
        "/images/products/french-lantern-sleeves-corset-top/1.jpeg",
        "/images/products/french-lantern-sleeves-corset-top/2.jpeg",
      ],
      sizes: ["S", "M", "L"],
      stock: 15,
      description: "Beautiful French lantern sleeves corset top with romantic flair."
    },
    {
      name: "Gen-Z Touch Denim",
      category: "denim-jeans",
      brand: "Streetwear",
      price: 1899,
      condition: "New",
      images: [
        "/images/products/gen-z-touch-denim/1.jpeg",
        "/images/products/gen-z-touch-denim/2.jpeg",
      ],
      sizes: ["28", "30", "32", "34"],
      stock: 35,
      description: "Modern denim with Gen-Z style. Trendy and comfortable."
    },
    {
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
      sizes: ["28", "30", "32", "34"],
      stock: 22,
      description: "Retro bell bottom jeans with heart shape details. Groovy and stylish."
    },
    {
      name: "HeartShape Leather Purse",
      category: "handbags",
      brand: "Luxury Editions",
      price: 2499,
      condition: "New",
      images: [
        "/images/products/heartshape-leather-purse/purse1.jpg",
        "/images/products/heartshape-leather-purse/purse2.jpg",
      ],
      sizes: ["One Size"],
      stock: 12,
      badge: "New",
      description: "Adorable heart-shaped leather purse. Perfect accessory for any outfit."
    },
    {
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
      sizes: ["S", "M", "L", "XL"],
      stock: 18,
      description: "Unique patchwork faux leather jacket. Statement piece for fashion-forward individuals."
    },
    {
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
      sizes: ["XS", "S", "M", "L"],
      stock: 45,
      description: "Trendy puff full-sleeves top with Y2K aesthetic."
    },
    {
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
      sizes: ["XS", "S", "M", "L"],
      stock: 32,
      description: "Stunning red puff sleeve top with open back design. Perfect for parties."
    },
    {
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
      sizes: ["XS", "S", "M", "L"],
      stock: 28,
      description: "Elegant ruffled blouse with charming bow closure."
    },
    {
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
      sizes: ["One Size"],
      stock: 20,
      description: "Classic white handbag that goes with everything. Timeless piece."
    },
    {
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
      sizes: ["XS", "S", "M", "L"],
      stock: 50,
      description: "Cute white polka dot top for a fresh and fun look."
    },
    {
      name: "Coach Tabby Bag Daisy Print",
      category: "handbags",
      brand: "Coach",
      price: 3999,
      condition: "New",
      images: [
        "/images/products/coach-tabby-bag-daisy-print-90s-trend.webp",
      ],
      sizes: ["One Size"],
      stock: 8,
      badge: "Bestseller",
      description: "Designer Coach Tabby bag with daisy print. 90s trend revival."
    },
    {
      name: "Messenger Bag",
      category: "handbags",
      brand: "Casual Carry",
      price: 1799,
      condition: "New",
      images: [
        "/images/products/messanger-bag.avif",
      ],
      sizes: ["One Size"],
      stock: 25,
      description: "Practical and stylish messenger bag for daily use."
    },
  ];

  // Normalize each product with slug generation
  return products.map((product, index) => normalizeProduct(product, index, existingSlugs));
};

// ✅ Import function
const importData = async () => {
  try {
    await connectDB();
    await Product.deleteMany();
    console.log("🗑️ Cleared existing products");
    
    const productsWithSlugs = getProductsWithSlugs();
    const insertedProducts = await Product.insertMany(productsWithSlugs);
    console.log(`✅ Imported ${insertedProducts.length} products successfully!`);
    
    // Display slugs for verification
    console.log("\n📋 Generated Slugs:");
    insertedProducts.forEach(p => {
      console.log(`  - ${p.name} → ${p.slug}`);
    });
    
    process.exit();
  } catch (err) {
    console.error("❌ Error importing data:", err);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await connectDB();
    await Product.deleteMany();
    console.log("🗑️ All products destroyed!");
    process.exit();
  } catch (err) {
    console.error("❌ Error destroying data:", err);
    process.exit(1);
  }
};

// Run based on command line argument
if (process.argv[2] === "-d") {
  destroyData();
} else {
  importData();
}