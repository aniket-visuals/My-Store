const fs = require('fs');
let code = fs.readFileSync('src/components/FeaturedProducts.tsx', 'utf8');

code = code.replace(/}: FeaturedProductsProps\) \{/, `}: FeaturedProductsProps) {\n  const { products: PRODUCTS_DATA } = useProducts();`);

fs.writeFileSync('src/components/FeaturedProducts.tsx', code);
