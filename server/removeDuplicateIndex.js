import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const removeDuplicateIndex = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");
    
    const db = mongoose.connection.db;
    const collection = db.collection("products");
    
    // Get all indexes
    const indexes = await collection.indexes();
    console.log("\n📋 Current indexes:");
    indexes.forEach(idx => {
      console.log(`  - ${idx.name}: ${JSON.stringify(idx.key)}`);
    });
    
    // Find duplicate slug indexes
    const slugIndexes = indexes.filter(idx => idx.key.slug === 1);
    
    if (slugIndexes.length > 1) {
      console.log(`\n⚠️ Found ${slugIndexes.length} slug indexes. Removing duplicates...`);
      
      // Keep the first one, drop the rest
      for (let i = 1; i < slugIndexes.length; i++) {
        await collection.dropIndex(slugIndexes[i].name);
        console.log(`✅ Dropped index: ${slugIndexes[i].name}`);
      }
    } else {
      console.log("\n✅ No duplicate slug indexes found.");
    }
    
    // Verify final indexes
    const finalIndexes = await collection.indexes();
    console.log("\n📋 Final indexes:");
    finalIndexes.forEach(idx => {
      console.log(`  - ${idx.name}: ${JSON.stringify(idx.key)}`);
    });
    
    await mongoose.disconnect();
    console.log("\n✅ Done!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

removeDuplicateIndex();