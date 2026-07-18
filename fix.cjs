const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

code = code.replace(/\\\\\`Thanks for purchasing/g, '\`Thanks for purchasing');
code = code.replace(/\\\\\`Download:/g, '\`Download:');
code = code.replace(/\\\\\`Hi \{\{customer_name\}\}/g, '\`Hi {{customer_name}}');

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
