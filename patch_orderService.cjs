const fs = require('fs');
let code = fs.readFileSync('src/services/orderService.ts', 'utf8');

code = code.replace(
  `import { db } from "../firebase";`,
  `import { db, auth } from "../firebase";`
);

code = code.replace(
  `      ...orderData,
      orderId: newOrderId,
      status: "Pending",
      createdAt: serverTimestamp()`,
  `      ...orderData,
      orderId: newOrderId,
      userId: auth.currentUser?.uid || "anonymous",
      status: "Pending",
      createdAt: serverTimestamp()`
);

fs.writeFileSync('src/services/orderService.ts', code);
