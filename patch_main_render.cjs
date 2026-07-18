const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

code = code.replace(
  /\{currentPage === "orders" \? renderOrders\(\) : renderProducts\(\)\}/,
  `{currentPage === "orders" ? renderOrders() : currentPage === "edit-product" ? renderEditProduct() : renderProducts()}`
);

// We should also change the title depending on currentPage
code = code.replace(
  /\{currentPage === "orders" \? "Orders" : "Products"\}/,
  `{currentPage === "orders" ? "Orders" : currentPage === "edit-product" ? "Edit Product" : "Products"}`
);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
