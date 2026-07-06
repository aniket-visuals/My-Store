const fs = require('fs');
let code = fs.readFileSync('src/services/orderService.ts', 'utf8');

code = code.replace(
  `export const uploadScreenshot = async (file: File): Promise<string> => {`,
  `export const uploadScreenshot = async (file: File): Promise<string> => {
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
    throw new Error("Cloudinary configuration is missing. Please set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in the environment.");
  }`
);

fs.writeFileSync('src/services/orderService.ts', code);
