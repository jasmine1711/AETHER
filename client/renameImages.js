// renameImages.js
const fs = require("fs");
const path = require("path");

// Path to your products folder
const productsDir = path.join(__dirname, "public/images/products");

fs.readdir(productsDir, (err, files) => {
  if (err) {
    return console.error("Error reading products folder:", err);
  }

  files.forEach((file) => {
    const ext = path.extname(file); // keep the extension
    const nameWithoutExt = path.basename(file, ext);

    // Convert to lowercase, replace spaces with hyphens, remove special characters
    const newName =
      nameWithoutExt
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9\-]/g, "") + ext.toLowerCase();

    const oldPath = path.join(productsDir, file);
    const newPath = path.join(productsDir, newName);

    // Rename file
    fs.rename(oldPath, newPath, (err) => {
      if (err) {
        console.error(`Failed to rename ${file}:`, err);
      } else {
        console.log(`Renamed: ${file} → ${newName}`);
      }
    });
  });
});
