const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/import \{ PRODUCTS_DATA \} from "\.\/data";/, `import { useProducts } from "./hooks/useProducts";`);

code = code.replace(/function ProductRouteWrapper\(\{/, `function ProductRouteWrapper({\n  products,`);

code = code.replace(/toggleWishlist\n\}\:/, `toggleWishlist,\n  products\n}:`);

code = code.replace(/toggleWishlist: \(product: Product\) => void;\n\}\) \{/, `toggleWishlist: (product: Product) => void;\n  products: Product[];\n}) {`);

code = code.replace(/const currentProduct = PRODUCTS_DATA\.find\(/, `const currentProduct = products.find(`);

// Also we need to fetch products in App component and pass them to ProductRouteWrapper
code = code.replace(/export default function App\(\) \{/, `export default function App() {\n  const { products } = useProducts();`);

code = code.replace(/<ProductRouteWrapper\n/g, `<ProductRouteWrapper\n                  products={products}\n`);

fs.writeFileSync('src/App.tsx', code);
