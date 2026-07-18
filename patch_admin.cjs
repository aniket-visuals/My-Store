const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

code = code.replace(
  /const \[currentPage, setCurrentPage\] = useState<"orders" \| "products">/,
  `const [currentPage, setCurrentPage] = useState<"orders" | "products" | "edit-product">`
);

code = code.replace(
  /const \[productStatusFilter, setProductStatusFilter\] = useState<"All" \| "Published" \| "Draft">\("All"\);/,
  `const [productStatusFilter, setProductStatusFilter] = useState<"All" | "Published" | "Draft">("All");
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);`
);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
