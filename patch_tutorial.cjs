const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

code = code.replace(
  /const productBody = activeProductForOrder\?.emailBody \|\| \`Download:\\n\$\{activeProductForOrder\?.downloadLink \|\| "No link"\}\`;/g,
  `const productBody = activeProductForOrder?.emailBody || \\\`Download:\\n\${activeProductForOrder?.downloadLink || "No link"}\${activeProductForOrder?.tutorialLink ? \\\`\\n\\nTutorial:\\n\${activeProductForOrder.tutorialLink}\\\` : ""}\\\`;`
);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
