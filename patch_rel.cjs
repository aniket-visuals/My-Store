const fs = require('fs');

const files = [
  'src/components/FaqSection.tsx',
  'src/components/Footer.tsx',
  'src/components/AccountPortal.tsx'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let code = fs.readFileSync(file, 'utf8');
    code = code.replace(/rel="noreferrer"/g, 'rel="noopener noreferrer"');
    fs.writeFileSync(file, code);
  }
});
