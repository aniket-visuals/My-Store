const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

code = code.replace(
  /onClick=\{\(\) => showToast\("Edit flow is coming soon", "success"\)\}/,
  `onClick={() => {
                          setEditingProduct(product);
                          setCurrentPage("edit-product");
                        }}`
);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
