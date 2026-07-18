const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

code = code.replace(
  /const filteredOrders = orders\.filter/,
  `const filteredProducts = products.filter(product => {
    const searchLower = productSearchTerm.toLowerCase();
    const matchesSearch = 
      (product.name || "").toLowerCase().includes(searchLower) ||
      (product.id || "").toLowerCase().includes(searchLower);
      
    const matchesFilter = productStatusFilter === "All" || product.status === productStatusFilter;
    return matchesSearch && matchesFilter;
  });

  const filteredOrders = orders.filter`
);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
