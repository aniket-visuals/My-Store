const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

code = code.replace(
  `onClick={() => handleStatusUpdate(confirmModal.order, confirmModal.action)}`,
  `onClick={() => handleStatusUpdate(confirmModal.order, confirmModal.action === "Approve" ? "Approved" : "Rejected")}`
);

code = code.replace(
  `case "approved": return "bg-emerald-100 text-emerald-700 border-emerald-200";`,
  `case "approved": 
      case "approve": return "bg-emerald-100 text-emerald-700 border-emerald-200";`
);

code = code.replace(
  `const matchesFilter = statusFilter === "All" || (order.status || "").toLowerCase() === statusFilter.toLowerCase();`,
  `let s = (order.status || "").toLowerCase();
    if (s === "approve") s = "approved";
    if (s === "reject") s = "rejected";
    const matchesFilter = statusFilter === "All" || s === statusFilter.toLowerCase();`
);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
