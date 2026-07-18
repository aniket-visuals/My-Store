const fs = require('fs');

// 1. AdminDashboard.tsx
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');
// Remove import
code = code.replace(/import \{ PRODUCTS_DATA \} from "\.\.\/data";\n/, "");
// Replace snapshot empty fallback
code = code.replace(/if \(snapshot\.empty\) \{[\s\S]*?\} else \{/, "if (snapshot.empty) {\n        setProducts([]);\n        setProductsLoading(false);\n      } else {");
// Also there might be another one in the error block
code = code.replace(/console\.error\("Error fetching products:", error\);\n      const mockProducts: AdminProduct\[\] = PRODUCTS_DATA\.map\([\s\S]*?setProductsLoading\(false\);\n    \}\);/, "console.error(\"Error fetching products:\", error);\n      setProducts([]);\n      setProductsLoading(false);\n    });");
fs.writeFileSync('src/components/AdminDashboard.tsx', code);

// 2. useProducts.ts
code = fs.readFileSync('src/hooks/useProducts.ts', 'utf8');
code = code.replace(/import \{ PRODUCTS_DATA \} from "\.\.\/data";\n/, "");
code = code.replace(/useState<Product\[\]>\(PRODUCTS_DATA\)/, "useState<Product[]>([])");
code = code.replace(/setProducts\(PRODUCTS_DATA\);/, "setProducts([])");
fs.writeFileSync('src/hooks/useProducts.ts', code);

// 3. data.ts
code = fs.readFileSync('src/data.ts', 'utf8');
code = code.replace(/export const PRODUCTS_DATA: Product\[\] = \[[\s\S]*?\];\n/, "export const PRODUCTS_DATA: Product[] = [];\n");
fs.writeFileSync('src/data.ts', code);

