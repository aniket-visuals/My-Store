const fs = require('fs');
let code = fs.readFileSync('src/components/ProductDetailPage.tsx', 'utf8');

code = code.replace(/const DYNAMIC_FAQS[\s\S]*?\}\n  \]\n\};\n\n\n\n/, "");

code = code.replace(/\{...(DYNAMIC_FAQS\[currentProduct\.id\] \|\| COMMON_FAQS)\.map/, "{...COMMON_FAQS.map");

fs.writeFileSync('src/components/ProductDetailPage.tsx', code);
