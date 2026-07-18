const fs = require('fs');
let code = fs.readFileSync('src/components/ProductDetailPage.tsx', 'utf8');

code = code.replace(
  /<div className="space-y-4 font-sans text-sm text-brand-dark\/80 leading-relaxed font-normal">[\s\S]*?<\/p>/,
  `<div className="space-y-4 font-sans text-sm text-brand-dark/80 leading-relaxed font-normal">
                <p>{formatDescription(currentProduct.fullDescription || currentProduct.description)}</p>`
);
// Also remove the "font-semibold text-brand-dark" paragraph if any, wait, there's another paragraph. Let's see what else is there.

fs.writeFileSync('src/components/ProductDetailPage.tsx', code);
