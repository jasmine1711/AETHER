// scan-colon-routes.js
import fs from "fs";
import path from "path";

const ROUTE_METHODS = ["get", "post", "put", "delete", "patch", "use"];

// Recursively scan files
function scanDir(dir, badRoutes = []) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      scanDir(filePath, badRoutes);
    } else if (file.endsWith(".js")) {
      const content = fs.readFileSync(filePath, "utf8");

      ROUTE_METHODS.forEach((method) => {
        const regex = new RegExp(`\\.${method}\\(([^)]*)\\)`, "gi");
        let match;
        while ((match = regex.exec(content))) {
          const rawPath = match[1].split(",")[0].trim().replace(/['"`]/g, "");

          // Check if it has an invalid colon usage
          if (/:(\/|$)/.test(rawPath)) {
            badRoutes.push({ file: filePath, method, path: rawPath });
          }
        }
      });
    }
  }

  return badRoutes;
}

console.log("🔍 Scanning for bad colon usage in route paths...\n");

const issues = scanDir("./");

if (issues.length === 0) {
  console.log("✅ No invalid colon-based routes found.");
} else {
  console.error("❌ Found invalid route definitions:");
  issues.forEach((issue) => {
    console.error(`   ${issue.method.toUpperCase()} ${issue.path} in ${issue.file}`);
  });
}
