const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

code = code.replace(
  /const emailResult = await sendApprovalEmail\(\{\s*to_email: order\.email,[\s\S]*?window\.location\.href = mailtoLink;\s*\}/,
  `showToast(\`Opening your default mail app to send approval...\`, "success");
        const mailtoLink = \`mailto:\${order.email}?subject=\${encodeURIComponent(parsedSubject)}&body=\${encodeURIComponent(parsedBody)}\`;
        window.location.href = mailtoLink;`
);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
