const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

const target = `        if (currentMsgType === "custom") {
          rawSubject = customSub;
          rawBody = customBod;
        } else {
          rawSubject = activeProductForOrder?.emailSubject || \\\`Thanks for purchasing \${activeProductForOrder?.name || order.productName}\\\`;
          rawBody = activeProductForOrder?.emailBody || \\\`Download:\\n\${activeProductForOrder?.downloadLink || "No link"}\\\`;
        }`;

const replacement = `        if (currentMsgType === "custom") {
          rawSubject = customSub;
          rawBody = customBod;
        } else {
          rawSubject = activeProductForOrder?.emailSubject || \\\`Thanks for purchasing \${activeProductForOrder?.name || order.productName}\\\`;
          const productBody = activeProductForOrder?.emailBody || \\\`Download:\\n\${activeProductForOrder?.downloadLink || "No link"}\\\`;
          rawBody = \\\`Hi {{customer_name}},\\n\\n\${productBody}\\n\\nThank you,\\nEditors Hub Store\\\`;
        }`;

code = code.replace(target, replacement);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
