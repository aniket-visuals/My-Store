const fs = require('fs');
let code = fs.readFileSync('src/components/ProductDetailPage.tsx', 'utf8');

code = code.replace(
  /const \[currentProduct, setCurrentProduct\] = useState<Product>\(product\);/,
  `const currentProduct = product;`
);

code = code.replace(
  /setCurrentProduct\(product\);/,
  `// setCurrentProduct(product);`
);

fs.writeFileSync('src/components/ProductDetailPage.tsx', code);
