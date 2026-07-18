const fs = require('fs');

let portalCode = fs.readFileSync('src/components/AccountPortal.tsx', 'utf8');

portalCode = portalCode.replace(
  /onClick=\{\(\) => \{\n\s*if \(onClose\) onClose\(\);\n\s*else navigate\("\/"\);\n\s*\}\}/g,
  'onClick={() => {\n                  if (onClose) onClose();\n                  else navigate(-1);\n                }}'
);

fs.writeFileSync('src/components/AccountPortal.tsx', portalCode);
