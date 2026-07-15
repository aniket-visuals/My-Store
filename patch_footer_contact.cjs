const fs = require('fs');
let code = fs.readFileSync('src/components/Footer.tsx', 'utf8');

code = code.replace(
  `            <li>
              <a
                href="mailto:aniketrajcargal123@gmail.com"
                className="text-black/65 hover:text-brand-primary transition-colors block"
              >
                Contact
              </a>
            </li>`,
  `            <li>
              <a
                href="/contact"
                className="text-black/65 hover:text-brand-primary transition-colors block"
              >
                Contact
              </a>
            </li>`
);

fs.writeFileSync('src/components/Footer.tsx', code);
