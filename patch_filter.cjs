const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

code = code.replace(
  `    const matchesFilter = statusFilter === "All" || order.status === statusFilter;`,
  `    const matchesFilter = statusFilter === "All" || (order.status || "").toLowerCase() === statusFilter.toLowerCase();`
);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
