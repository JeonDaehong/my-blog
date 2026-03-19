const fs = require("fs");
const path = require("path");

try {
  const filePath = path.join(
    __dirname,
    "..",
    "node_modules",
    "next",
    "dist",
    "build",
    "generate-build-id.js"
  );
  let code = fs.readFileSync(filePath, "utf8");
  if (code.includes("let buildId = await generate()")) {
    code = code.replace(
      "let buildId = await generate();",
      'let buildId = typeof generate === "function" ? await generate() : null;'
    );
    fs.writeFileSync(filePath, code);
    console.log("Patched next/dist/build/generate-build-id.js");
  }
} catch (e) {
  // Silently skip if file not found
}
