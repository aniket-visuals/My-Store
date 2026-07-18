const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

code = code.replace(
  'rawBody = activeProductForOrder?.emailBody || `Download:\\n${activeProductForOrder?.downloadLink || "No link"}`;',
  'const productBody = activeProductForOrder?.emailBody || `Download:\\n${activeProductForOrder?.downloadLink || "No link"}`;\n          rawBody = `Hi {{customer_name}},\\n\\n${productBody}\\n\\nThank you,\\nEditors Hub Store`;'
);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
