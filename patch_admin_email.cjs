const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

// Import email service
code = code.replace(
  `import { OrderData } from "../services/orderService";`,
  `import { OrderData } from "../services/orderService";
import { sendApprovalEmail } from "../services/emailService";`
);

// Update handleStatusUpdate signature and logic
code = code.replace(
  `  const handleStatusUpdate = async (orderId: string, newStatus: "Approved" | "Rejected") => {
    try {
      await updateDoc(doc(db, "orders", orderId), { status: newStatus });
      showToast(\`Order successfully \${newStatus.toLowerCase()}\`, "success");
    } catch (error) {
      console.error("Error updating order:", error);
      showToast(\`Failed to \${newStatus.toLowerCase()} order\`, "error");
    }
    setConfirmModal(null);
  };`,
  `  const handleStatusUpdate = async (order: Order, newStatus: "Approved" | "Rejected") => {
    try {
      await updateDoc(doc(db, "orders", order.id), { status: newStatus });
      showToast(\`Order successfully \${newStatus.toLowerCase()}\`, "success");
      
      if (newStatus === "Approved") {
        showToast("Sending approval email...", "success");
        const emailSent = await sendApprovalEmail({
          to_email: order.email,
          to_name: order.customerName,
          order_id: order.orderId,
          product_name: order.productName,
          // Generate a mockup download link
          download_link: \`https://editorshub.store/download/\${order.productId}?order=\${order.orderId}\`
        });

        if (emailSent) {
          showToast(\`Approval email sent to \${order.email}\`, "success");
        } else {
          showToast(\`Failed to send email to \${order.email}\`, "error");
        }
      }
    } catch (error) {
      console.error("Error updating order:", error);
      showToast(\`Failed to \${newStatus.toLowerCase()} order\`, "error");
    }
    setConfirmModal(null);
  };`
);

// Update button onClick reference
code = code.replace(
  `onClick={() => handleStatusUpdate(confirmModal.order.id, confirmModal.action)}`,
  `onClick={() => handleStatusUpdate(confirmModal.order, confirmModal.action)}`
);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
