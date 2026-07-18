const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

code = code.replace(
  /showToast\(\`Opening your default mail app to send approval...\`, "success"\);\s*const mailtoLink = \`mailto:\$\{order\.email\}\?subject=\$\{encodeURIComponent\(parsedSubject\)\}&body=\$\{encodeURIComponent\(parsedBody\)\}\`;\s*window\.location\.href = mailtoLink;/,
  `const emailResult = await sendApprovalEmail({
          to_email: order.email,
          to_name: order.customerName,
          order_id: order.orderId,
          product_name: order.productName,
          download_link: parsedBody,
          subject: parsedSubject,
          body: parsedBody
        });
        if (emailResult.success) {
          showToast(\`Approval email sent to \${order.email}\`, "success");
        } else {
          showToast(\`Failed: \${emailResult.error || 'Unknown error'}\`, "error");
        }`
);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
