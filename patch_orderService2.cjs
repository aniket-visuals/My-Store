const fs = require('fs');
let code = fs.readFileSync('src/services/orderService.ts', 'utf8');

code = code.replace(
  `export const uploadScreenshot = async (file: File): Promise<string> => {`,
  `export const uploadScreenshot = async (file: File): Promise<string> => {
  const toBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
`
);

code = code.replace(
  `  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error("Cloudinary error:", errorData);
    throw new Error("Failed to upload screenshot to Cloudinary: " + (errorData.error?.message || "Unknown error"));
  }

  const data = await response.json();
  return data.secure_url;`,
  `  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error("Cloudinary error:", errorData);
    // Fallback to base64 if Cloudinary fails (e.g. preset format restrictions)
    console.log("Falling back to base64 image data...");
    return await toBase64(file);
  }

  const data = await response.json();
  return data.secure_url;`
);

fs.writeFileSync('src/services/orderService.ts', code);
