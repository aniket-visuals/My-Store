const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

code = code.replace(
  /order\.screenshotUrl/g,
  "order.paymentScreenshotUrl"
);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
