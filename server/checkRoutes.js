import fs from "fs";
import path from "path";

const routesDir = path.join(process.cwd(), "routes");

function checkRouteLine(line, file, lineNumber) {
  const routePattern = /router\.(get|post|put|delete|patch)\s*\(\s*['"`](.*?)['"`]/;
  const match = line.match(routePattern);
  if (match) {
    const routePath = match[2];
    // Check for empty parameter after colon or spaces
    const invalidParam = routePath.split("/").some(seg => seg.startsWith(":") && seg.length <= 1);
    if (invalidParam) {
      console.log(`❌ Invalid route in ${file}, line ${lineNumber}: ${routePath}`);
    }
  }
}

fs.readdirSync(routesDir).forEach(file => {
  if (file.endsWith(".js")) {
    const fullPath = path.join(routesDir, file);
    const lines = fs.readFileSync(fullPath, "utf-8").split("\n");
    lines.forEach((line, idx) => checkRouteLine(line, file, idx + 1));
  }
});
