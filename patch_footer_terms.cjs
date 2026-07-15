const fs = require('fs');
let code = fs.readFileSync('src/components/Footer.tsx', 'utf8');

if (!code.includes('Terms & Conditions')) {
  code = code.replace(
    `            <li>
              <a
                href="/privacy"
                className="text-black/65 hover:text-brand-primary transition-colors"
              >
                Privacy Policy
              </a>
            </li>`,
    `            <li>
              <a
                href="/privacy"
                className="text-black/65 hover:text-brand-primary transition-colors"
              >
                Privacy Policy
              </a>
            </li>
            <li>
              <a
                href="/terms"
                className="text-black/65 hover:text-brand-primary transition-colors"
              >
                Terms & Conditions
              </a>
            </li>`
  );

  fs.writeFileSync('src/components/Footer.tsx', code);
}
