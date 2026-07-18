const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

code = code.replace(
  /priceInr: 0,/,
  `priceInr: 0,\n            downloadCount: 0,\n            fileSize: "",\n            commercialRights: false,\n            faqs: [],`
);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
