const fs = require('fs');
let code = fs.readFileSync('src/hooks/useProducts.ts', 'utf8');
code = code.replace(
  /const fetchedProducts = snapshot.docs.map\(doc => {/,
  `const fetchedProducts = snapshot.docs.map(doc => {
          console.log("Fetched product:", doc.id, doc.data().faqs, doc.data().commercialRights);`
);
fs.writeFileSync('src/hooks/useProducts.ts', code);
