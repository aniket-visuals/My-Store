const fs = require('fs');
let code = fs.readFileSync('src/components/ProductDetailPage.tsx', 'utf8');

code = code.replace(/interface ProductDetailPageProps \{/, `interface ProductDetailPageProps {\n  allProducts?: Product[];`);

code = code.replace(/const MOCK_RELATED_PRODUCTS: Product\[\] = \[[\s\S]*?\];\n/, "");

code = code.replace(/export default function ProductDetailPage\(\{/, `export default function ProductDetailPage({\n  allProducts = [],`);

code = code.replace(/const otherProducts = MOCK_RELATED_PRODUCTS\.filter/, `const otherProducts = allProducts.filter`);

fs.writeFileSync('src/components/ProductDetailPage.tsx', code);
