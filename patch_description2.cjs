const fs = require('fs');
let code = fs.readFileSync('src/components/ProductDetailPage.tsx', 'utf8');

code = code.replace(
  /<div className="space-y-4 font-sans text-sm text-brand-dark\/80 leading-relaxed font-normal">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/,
  `<div className="space-y-4 font-sans text-sm text-brand-dark/80 leading-relaxed font-normal whitespace-pre-wrap">
                {currentProduct.fullDescription || currentProduct.description}
              </div>
            </div>
          </div>`
);

fs.writeFileSync('src/components/ProductDetailPage.tsx', code);
