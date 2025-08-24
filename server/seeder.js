require('dotenv').config({
  path: ['.env.local', '.env']
});

const mongoose = require('mongoose');
const Product = require('./models/Product');

const products = [
  // Original ÆTHER products
  { name: 'ÆTHER Classic Tee', category: 'Clothing', price: 1299 },
  { name: 'ÆTHER Denim Jacket', category: 'Clothing', price: 3499 },
  { name: 'ÆTHER Slim Fit Jeans', category: 'Clothing', price: 2199 },
  { name: 'ÆTHER Running Shoes', category: 'Shoes', price: 4499 },
  { name: 'ÆTHER High-top Sneakers', category: 'Shoes', price: 3999 },
  { name: 'ÆTHER Hoodie', category: 'Clothing', price: 2799 },

  // Thrift additions
  { name: 'Wide Leg Denims', category: 'Clothing', price: 1599 },
  { name: 'Bell Bottoms', category: 'Clothing', price: 1799 },
  { name: 'Corset Top', category: 'Clothing', price: 1299 },
  { name: 'Puff Sleeves Top', category: 'Clothing', price: 1399 },
  { name: 'Long Skirt', category: 'Clothing', price: 1699 },
  { name: 'Vintage Dress', category: 'Clothing', price: 1899 },
  { name: 'Leather Coat', category: 'Clothing', price: 3499 },

  // Shoes
  { name: 'Valley Flats', category: 'Shoes', price: 1499 },
  { name: 'Heels', category: 'Shoes', price: 1999 },
  { name: 'Loafers', category: 'Shoes', price: 1799 },
];

const seedProducts = async () => {
  try {
    console.log('🔗 Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected! Seeding products into aetherdb...');
    await Product.deleteMany();  // clears old data if exists
    await Product.insertMany(products);

    console.log('🎉 Products successfully seeded into aetherdb.products!');
    process.exit();
  } catch (err) {
    console.error('❌ Error seeding products:', err.message);
    process.exit(1);
  }
};

seedProducts();