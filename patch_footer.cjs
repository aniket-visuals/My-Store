const fs = require('fs');

let footerCode = fs.readFileSync('src/components/Footer.tsx', 'utf8');

if (!footerCode.includes('href="/refund"')) {
  footerCode = footerCode.replace(
    '<li>\n              <a\n                href="/terms"',
    '<li>\n              <a\n                href="/about"\n                className="text-black/65 hover:text-brand-primary transition-colors block"\n              >\n                About Us\n              </a>\n            </li>\n            <li>\n              <a\n                href="/refund"\n                className="text-black/65 hover:text-brand-primary transition-colors block"\n              >\n                Refund Policy\n              </a>\n            </li>\n            <li>\n              <a\n                href="/terms"'
  );
  fs.writeFileSync('src/components/Footer.tsx', footerCode);
}
