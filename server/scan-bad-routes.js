// scan-bad-routes.js
import fs from "fs";
import path from "path";

const ROUTES_DIR = path.join(process.cwd(), "routes");

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");

  lines.forEach((line, idx) => {
    // Match any route definitions like router.get('/path', ...)
    const routeMatch = line.match(/router\.(get|post|put|delete|patch)\s*\(\s*['"`](.*?)['"`]/i);
    if (routeMatch) {
      const routePath = routeMatch[2];

      // Look for suspicious/malformed params like ":/", ":?", "::" or empty ":"
      if (/:\W|:\?$|:\/|::/.test(routePath)) {
        console.log(`⚠️ Suspicious route in ${filePath} at line ${idx + 1}: ${routePath}`);
      }
    }
  });
}

function scanDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scanDir(fullPath);
    } else if (entry.isFile() && entry.name.endsWith(".js")) {
      scanFile(fullPath);
    }
  }
}

console.log("🔍 Scanning routes for invalid Express param definitions...");
scanDir(ROUTES_DIR);
console.log("✅ Scan complete.");
