const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

code = code.replace(
  `  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved": return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "Rejected": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-amber-100 text-amber-700 border-amber-200";
    }
  };`,
  `  const getStatusColor = (status: string) => {
    switch ((status || "").toLowerCase()) {
      case "approved": return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "rejected": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-amber-100 text-amber-700 border-amber-200";
    }
  };`
);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
