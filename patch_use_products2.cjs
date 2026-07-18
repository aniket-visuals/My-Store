const fs = require('fs');
let code = fs.readFileSync('src/hooks/useProducts.ts', 'utf8');
code = code.replace(
  /downloadCount: 0,/,
  `downloadCount: data.downloadCount || 0,`
);
fs.writeFileSync('src/hooks/useProducts.ts', code);
