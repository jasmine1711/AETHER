// fixSlugs.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "./models/Product.js"; // Check this path!

// --- IMPORTANT: Make sure this function is identical to your model's ---
import slugifyLib from "slugify";
const slugify = (text) => {
  return slugifyLib(text, { lower: true, strict: true });
};
// ---

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected for slug script.");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  }
};

const updateSlugs = async () => {
  await connectDB();

  try {
    const productsToUpdate = await Product.find({
      $or: [{ slug: { $exists: false } }, { slug: null }, { slug: "" }],
    });

    if (productsToUpdate.length === 0) {
      console.log("🎉 All products already have slugs. Nothing to do.");
      return;
    }

    console.log(`Found ${productsToUpdate.length} products missing a slug. Updating...`);

    let updatedCount = 0;
    for (const product of productsToUpdate) {
      let baseSlug = slugify(product.name);
      let newSlug = baseSlug;
      let counter = 1;

      // Check for potential duplicates
      while (
        await Product.findOne({ slug: newSlug, _id: { $ne: product._id } })
      ) {
        newSlug = `${baseSlug}-${counter++}`;
      }

      // ✅ THIS IS THE FIX:
      // Use updateOne to set only the slug, bypassing other validators.
      await Product.updateOne(
        { _id: product._id },
        { $set: { slug: newSlug } }
      );

      console.log(`- Updated "${product.name}" -> ${newSlug}`);
      updatedCount++;
    }

    console.log(`\n✅ Successfully updated ${updatedCount} product slugs.`);
  } catch (error) {
    console.error("❌ Error updating slugs:", error);
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB disconnected.");
  }
};

updateSlugs();