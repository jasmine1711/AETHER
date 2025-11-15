import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import Product from "./models/Product.js"; // <-- Make sure this path is correct

// Load .env variables
dotenv.config();

const updateImagePaths = async () => {
  if (!process.env.MONGO_URI) {
    console.error("Error: MONGO_URI is not defined in your .env file.");
    process.exit(1);
  }

  let connection;
  try {
    connection = await mongoose.connect(process.env.MONGO_URI);
    console.log(" MongoDB connected. Starting update...");

    const products = await Product.find({});
    console.log(`Found ${products.length} products to check...`);

    let updatedCount = 0;

    // We use Promise.all to update all products in parallel
    const updatePromises = products.map(async (product) => {
      if (!product.slug) {
        console.warn(`Skipping product "${product.name}" (ID: ${product._id}) - no slug found.`);
        return;
      }

      let needsUpdate = false;

      // 1. Update the 'images' array
      const newImages = product.images.map((oldPath) => {
        if (!oldPath) return oldPath; // Skip if path is null or empty
        const filename = path.basename(oldPath);
        const newPath = `/images/products/${product.slug}/${filename}`;
        
        if (oldPath !== newPath) {
          needsUpdate = true;
        }
        return newPath;
      });

      // 2. Update the 'thumbnail' field
      if (product.thumbnail) {
        const oldThumbnailPath = product.thumbnail;
        const thumbnailFilename = path.basename(oldThumbnailPath);
        const newThumbnailPath = `/images/products/${product.slug}/${thumbnailFilename}`;

        if (oldThumbnailPath !== newThumbnailPath) {
          product.thumbnail = newThumbnailPath;
          needsUpdate = true;
        }
      }
      
      product.images = newImages;

      // 3. Save the product ONLY if changes were made
      if (needsUpdate) {
        updatedCount++;
         await product.save({ validateBeforeSave: false });
        console.log(`Updated product: ${product.name}`);
      }
    });

    await Promise.all(updatePromises);

    console.log("\n---------------------------------");
    console.log(` Update complete! ${updatedCount} products were updated.`);
    console.log("---------------------------------");

  } catch (error) {
    console.error("Error during image path update:", error);
  } finally {
    if (connection) {
      await mongoose.disconnect();
      console.log("🔌 MongoDB disconnected.");
    }
  }
};

// Run the script
updateImagePaths();