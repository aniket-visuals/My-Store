const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

code = code.replace(
  `    const matchesSearch = 
      order.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName?.toLowerCase().includes(searchTerm.toLowerCase());`,
  `    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      (order.orderId || "").toLowerCase().includes(searchLower) ||
      (order.email || "").toLowerCase().includes(searchLower) ||
      (order.customerName || "").toLowerCase().includes(searchLower);`
);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
