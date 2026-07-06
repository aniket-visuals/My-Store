const fs = require('fs');
let code = fs.readFileSync('src/services/orderService.ts', 'utf8');

code = code.replace(
  `  if (!response.ok) {
    throw new Error("Failed to upload screenshot to Cloudinary.");
  }`,
  `  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error("Cloudinary error:", errorData);
    throw new Error("Failed to upload screenshot to Cloudinary: " + (errorData.error?.message || "Unknown error"));
  }`
);

fs.writeFileSync('src/services/orderService.ts', code);
