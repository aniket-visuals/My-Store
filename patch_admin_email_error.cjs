const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

code = code.replace(
  /const emailSent = await sendApprovalEmail\(\{([\s\S]*?)\}\);\s*if \(emailSent\) \{/,
  `const emailResult = await sendApprovalEmail({$1});
        if (emailResult.success) {`
);

code = code.replace(
  /showToast\(\`Failed to send email to \$\{order\.email\}\`, "error"\);/,
  `showToast(\`Failed: \${emailResult.error || 'Unknown error'}\`, "error");`
);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
