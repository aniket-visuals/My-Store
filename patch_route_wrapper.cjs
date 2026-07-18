const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /<ProductDetailPage\n[\s\S]*?product=\{currentProduct\}\n[\s\S]*?\/>/,
  `<ProductDetailPage
      product={currentProduct}
      allProducts={products}
      onBack={() => navigate("/")}
      addToCart={addToCart}
      inCart={cart.some((item) => item.id === currentProduct.id)}
      wishlist={wishlist}
      toggleWishlist={toggleWishlist}
    />`
);

fs.writeFileSync('src/App.tsx', code);
