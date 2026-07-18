const fs = require('fs');
let code = fs.readFileSync('src/hooks/useProducts.ts', 'utf8');
code = code.replace(
  /fileSize: "N\/A",/,
  `fileSize: data.fileSize || "N/A",\n            commercialRights: data.commercialRights || false,\n            faqs: data.faqs || [],`
);
fs.writeFileSync('src/hooks/useProducts.ts', code);
