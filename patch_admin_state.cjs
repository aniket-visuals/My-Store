const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

code = code.replace(
  /const \[statusFilter, setStatusFilter\] = useState<"All" \| "Pending" \| "Approved" \| "Rejected">("All");/,
  `const [statusFilter, setStatusFilter] = useState<"All" | "Pending" | "Approved" | "Rejected">("All");
  
  const [currentPage, setCurrentPage] = useState<"orders" | "products">("products");
  const [products, setProducts] = useState<any[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productSearchTerm, setProductSearchTerm] = useState("");
  const [productStatusFilter, setProductStatusFilter] = useState<"All" | "Published" | "Draft">("All");`
);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
