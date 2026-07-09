const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

code = code.replace(
  `  const handleStatusUpdate = async (order: Order, newStatus: "Approved" | "Rejected") => {
    try {
      await updateDoc(doc(db, "orders", order.id), { status: newStatus });`,
  `  const handleStatusUpdate = async (order: Order, newStatus: "Approved" | "Rejected") => {
    setConfirmModal(null);
    try {
      await updateDoc(doc(db, "orders", order.id), { status: newStatus });`
);

code = code.replace(
  `      console.error("Error updating order:", error);
      showToast(\`Failed to \${newStatus.toLowerCase()} order\`, "error");
    }
    setConfirmModal(null);
  };`,
  `      console.error("Error updating order:", error);
      showToast(\`Failed to \${newStatus.toLowerCase()} order\`, "error");
    }
  };`
);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
