const fs = require('fs');
let code = fs.readFileSync('src/components/ProductDetailPage.tsx', 'utf-8');

code = code.replace(/const finalAvatar = currentUser\.photoURL \|\| "https:\/\/res\.cloudinary\.com\/df5rgwdng\/image\/upload\/v1780754431\/bd0c7c0d-f709-453d-9227-298947b772d9-modified_f3lhy1\.png";/, 'const finalAvatar = currentUser.photoURL || null;');

code = code.replace(/const hasGenericAvatar = rev\.avatar === "https:\/\/res\.cloudinary\.com\/df5rgwdng\/image\/upload\/v1780754431\/bd0c7c0d-f709-453d-9227-298947b772d9-modified_f3lhy1\.png";/, 'const hasGenericAvatar = rev.avatar === "https://res.cloudinary.com/df5rgwdng/image/upload/v1780754431/bd0c7c0d-f709-453d-9227-298947b772d9-modified_f3lhy1.png";');

fs.writeFileSync('src/components/ProductDetailPage.tsx', code);
