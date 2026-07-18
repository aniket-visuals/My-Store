const fs = require('fs');
let code = fs.readFileSync('src/components/ProductDetailPage.tsx', 'utf8');

code = code.replace(
  /const getGalleryImages = \(prod: Product\): string\[\] => \{[\s\S]*?^\};/m,
  `const getGalleryImages = (prod: Product): string[] => {
  if (prod.galleryImages && prod.galleryImages.length > 0) {
    return [prod.image, ...prod.galleryImages];
  }
  return [prod.image];
};`
);

fs.writeFileSync('src/components/ProductDetailPage.tsx', code);
