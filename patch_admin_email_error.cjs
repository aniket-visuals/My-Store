const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

code = code.replace(
  /showToast\(\`Failed: \$\{emailResult\.error \|\| 'Unknown error'\}\`, "error"\);/,
  `showToast(\`EmailJS Error: \$\{emailResult.error || 'Unknown error'\}\`, "error");`
);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
