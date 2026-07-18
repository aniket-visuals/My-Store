const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

code = code.replace(
  /        if \(currentMsgType === "custom"\) \{\n          rawSubject = customSub;\n          rawBody = customBod;\n        \} else \{\n          rawSubject = activeProductForOrder\?.emailSubject \|\| \`Thanks for purchasing \$\{activeProductForOrder\?.name \|\| order.productName\}\`;\n          rawBody = activeProductForOrder\?.emailBody \|\| \`Download:\\\n\$\{activeProductForOrder\?.downloadLink \|\| "No link"\}\`;\n        \}/,
  `        if (currentMsgType === "custom") {
          rawSubject = customSub;
          rawBody = customBod;
        } else {
          rawSubject = activeProductForOrder?.emailSubject || \\\`Thanks for purchasing \${activeProductForOrder?.name || order.productName}\\\`;
          const productBody = activeProductForOrder?.emailBody || \\\`Download:\\n\${activeProductForOrder?.downloadLink || "No link"}\\\`;
          rawBody = \\\`Hi {{customer_name}},\\n\\n\${productBody}\\n\\nThank you,\\nEditors Hub Store\\\`;
        }`
);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
