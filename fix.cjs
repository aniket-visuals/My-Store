const fs = require('fs');
let code = fs.readFileSync('src/components/CheckoutPage.tsx', 'utf-8');

code = code.replace(
  /\\(isFormValid && !isSubmitting\\)\\s+isFormValid/g,
  '(isFormValid && !isSubmitting)'
);

fs.writeFileSync('src/components/CheckoutPage.tsx', code);
