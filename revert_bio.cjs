const fs = require('fs');
let code = fs.readFileSync('src/components/ProductDetailPage.tsx', 'utf-8');

code = code.replace(/Freelance creative professional always looking for high-quality assets to level up my projects\./g, 'No bio available.');

fs.writeFileSync('src/components/ProductDetailPage.tsx', code);
