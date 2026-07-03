const fs = require('fs');
let code = fs.readFileSync('src/components/AuthenticatedDashboard.tsx', 'utf-8');
code = code.replace(/EDIT PROFILE TAB CONTENT/g, 'MANAGE PROFILE TAB CONTENT');
fs.writeFileSync('src/components/AuthenticatedDashboard.tsx', code);
