const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

const updateFunctionReplacement = `  const handleStatusUpdate = async (order: Order, newStatus: "Approved" | "Rejected") => {
    const currentMsgType = approvalMessageType;
    const customSub = customEmailSubject;
    const customBod = customEmailBody;

    setConfirmModal(null);
    try {
      await updateDoc(doc(db, "orders", order.id), { status: newStatus });
      showToast(\`Order successfully \${newStatus.toLowerCase()}\`, "success");
      
      if (newStatus === "Approved") {
        showToast("Sending approval email...", "success");
        
        const activeProductForOrder = products.find(p => p.id === order.productId);
        
        const replaceVariables = (text: string) => {
          if (!text) return "";
          return text
            .replace(/\\{\\{customer_name\\}\\}/g, order.customerName || "")
            .replace(/\\{\\{customer_email\\}\\}/g, order.email || "")
            .replace(/\\{\\{product_name\\}\\}/g, activeProductForOrder?.name || order.productName || "")
            .replace(/\\{\\{order_id\\}\\}/g, order.orderId || "")
            .replace(/\\{\\{payment_method\\}\\}/g, order.paymentMethod || "")
            .replace(/\\{\\{price\\}\\}/g, order.amount?.toString() || "");
        };

        let rawSubject = "";
        let rawBody = "";

        if (currentMsgType === "custom") {
          rawSubject = customSub;
          rawBody = customBod;
        } else {
          rawSubject = activeProductForOrder?.emailSubject || \`Thanks for purchasing \${activeProductForOrder?.name || order.productName}\`;
          rawBody = activeProductForOrder?.emailBody || \`Download:\\n\${activeProductForOrder?.downloadLink || "No link"}\`;
        }
        
        const parsedSubject = replaceVariables(rawSubject);
        const parsedBody = replaceVariables(rawBody);

        const emailSent = await sendApprovalEmail({
          to_email: order.email,
          to_name: order.customerName,
          order_id: order.orderId,
          product_name: order.productName,
          download_link: parsedBody,
          subject: parsedSubject,
          body: parsedBody
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
  };`;

code = code.replace(
  /const handleStatusUpdate = async \(order: Order, newStatus: "Approved" \| "Rejected"\) => \{[\s\S]*?showToast\(`Failed to \$\{newStatus\.toLowerCase\(\)\} order`, "error"\);\n    \}\n  \};/,
  updateFunctionReplacement
);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
