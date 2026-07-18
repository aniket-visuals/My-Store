const fs = require('fs');
let code = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

code = code.replace(/import \{ PRODUCTS_DATA \} from "\.\.\/data";/, `import { useProducts } from "../hooks/useProducts";`);
code = code.replace(/export default function Navbar\(\{/, `export default function Navbar({\n  const { products: PRODUCTS_DATA } = useProducts();\n`);

fs.writeFileSync('src/components/Navbar.tsx', code);
