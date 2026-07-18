const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

code = code.replace(
  /showToast\(\`Failed: \$\{emailResult\.error \|\| 'Unknown error'\}\`, "error"\);/,
  `showToast(\`Automated email failed. Opening your default mail app instead...\`, "error");
          const mailtoLink = \`mailto:\${order.email}?subject=\${encodeURIComponent(parsedSubject)}&body=\${encodeURIComponent(parsedBody)}\`;
          window.location.href = mailtoLink;`
);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
