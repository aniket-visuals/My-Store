const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

code = code.replace(
  /\/\/ Generate a mockup download link\n\s*download_link: \`https:\/\/www\.editorshubstore\.in\/download\/\$\{order\.productId\}\?order=\$\{order\.orderId\}\`/,
  `// Get actual download link from product\n          download_link: products.find(p => p.id === order.productId)?.downloadLink || \`https://www.editorshubstore.in/download/\${order.productId}?order=\${order.orderId}\``
);

code = code.replace(/updateDoc, setDoc/g, "updateDoc"); // Fix previous syntax error if any

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
