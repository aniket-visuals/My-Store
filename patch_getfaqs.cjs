const fs = require('fs');
let code = fs.readFileSync('src/components/ProductDetailPage.tsx', 'utf8');

code = code.replace(
  /const getActiveFaqs = \(\) => \{[\s\S]*?\};\n/,
  `const getActiveFaqs = () => COMMON_FAQS;\n`
);

fs.writeFileSync('src/components/ProductDetailPage.tsx', code);
