const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

const target = `      {/* Confirmation Modal */}
      {confirmModal && (() => {
        const activeProductForOrder = products.find(p => p.id === confirmModal.order.productId);
        const defaultSubject = activeProductForOrder?.emailSubject || \\\`Thanks for purchasing \${activeProductForOrder?.name}\\\`;
        const defaultBody = activeProductForOrder?.emailBody || \\\`Download:\\n\${activeProductForOrder?.downloadLink || "No link"}\\\`;`;

const replacement = `      {/* Confirmation Modal */}
      {confirmModal && (() => {
        const activeProductForOrder = products.find(p => p.id === confirmModal.order.productId);
        
        const replaceVars = (text: string) => {
          if (!text) return "";
          return text
            .replace(/\\{\\{customer_name\\}\\}/g, confirmModal.order.customerName || "")
            .replace(/\\{\\{customer_email\\}\\}/g, confirmModal.order.email || "")
            .replace(/\\{\\{product_name\\}\\}/g, activeProductForOrder?.name || confirmModal.order.productName || "")
            .replace(/\\{\\{order_id\\}\\}/g, confirmModal.order.orderId || "")
            .replace(/\\{\\{payment_method\\}\\}/g, confirmModal.order.paymentMethod || "")
            .replace(/\\{\\{price\\}\\}/g, confirmModal.order.amount?.toString() || "");
        };

        const rawSubject = activeProductForOrder?.emailSubject || \\\`Thanks for purchasing \${activeProductForOrder?.name || confirmModal.order.productName}\\\`;
        const productBody = activeProductForOrder?.emailBody || \\\`Download:\\n\${activeProductForOrder?.downloadLink || "No link"}\\\`;
        const rawBody = \\\`Hi {{customer_name}},\\n\\n\${productBody}\\n\\nThank you,\\nEditors Hub Store\\\`;

        const defaultSubject = replaceVars(rawSubject);
        const defaultBody = replaceVars(rawBody);`;

code = code.replace(target, replacement);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
