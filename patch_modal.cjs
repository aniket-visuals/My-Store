const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

code = code.replace(
  /const defaultSubject = activeProductForOrder\?.emailSubject \|\| \`Thanks for purchasing \$\{activeProductForOrder\?.name\}\`;\n        const defaultBody = activeProductForOrder\?.emailBody \|\| \`Download:\\\n\$\{activeProductForOrder\?.downloadLink \|\| "No link"\}\`;/,
  `const rawDefaultSubject = activeProductForOrder?.emailSubject || \`Thanks for purchasing \${activeProductForOrder?.name || confirmModal.order.productName}\`;
        const rawDefaultBody = activeProductForOrder?.emailBody || \`Download:\\n\${activeProductForOrder?.downloadLink || "No link"}\`;

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

        const defaultSubject = replaceVars(rawDefaultSubject);
        const defaultBody = replaceVars(rawDefaultBody);`
);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
