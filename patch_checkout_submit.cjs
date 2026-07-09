const fs = require('fs');
let code = fs.readFileSync('src/components/CheckoutPage.tsx', 'utf8');

code = code.replace(
  `{isSubmitting ? "Processing..." : "Submit Order"}`,
  `{!isAuthenticated ? "Please Login to Submit" : isSubmitting ? "Processing..." : "Submit Order"}`
);

fs.writeFileSync('src/components/CheckoutPage.tsx', code);
