const fs = require('fs');
let code = fs.readFileSync('src/services/orderService.ts', 'utf8');

code = code.replace(
  `console.error("Cloudinary failed, falling back to compressed base64:", error);`,
  `console.log("Cloudinary upload issue, using compressed base64 instead.");`
);

fs.writeFileSync('src/services/orderService.ts', code);
