const fs = require('fs');
let code = fs.readFileSync('src/components/CheckoutPage.tsx', 'utf8');

code = code.replace(
  /const inrConversionRate = 93;\n  const priceINR = totalPrice \* inrConversionRate;/,
  `const priceINR = cart.reduce((acc, item) => acc + (item.priceInr || item.price * 83), 0);`
);

fs.writeFileSync('src/components/CheckoutPage.tsx', code);
