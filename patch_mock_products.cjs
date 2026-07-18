const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

code = code.replace(
  /const mockProducts = PRODUCTS_DATA\.map\(p => \(\{\n\s*\.\.\.p,\n\s*status: "Published",\n\s*priceInr: p\.price \* 83,\n\s*updatedAt: new Date\(p\.releaseDate \|\| Date\.now\(\)\)\n\s*\}\)\);/g,
  `const mockProducts: AdminProduct[] = PRODUCTS_DATA.map(p => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          shortDescription: p.description || "",
          fullDescription: p.description || "",
          category: p.category,
          thumbnail: p.image,
          galleryImages: [],
          previewVideo: p.videoPreview,
          status: "Published",
          priceUsd: p.price,
          priceInr: p.price * 83,
          downloadLink: "#",
          metaTitle: p.name,
          metaDescription: p.description || "",
          createdAt: new Date(p.releaseDate || Date.now()),
          updatedAt: new Date(p.releaseDate || Date.now())
        }));`
);

// also fix the productsData.push casting
code = code.replace(
  /productsData\.push\(\{ id: doc\.id, \.\.\.doc\.data\(\) \}\);/g,
  `productsData.push({ id: doc.id, ...doc.data() } as AdminProduct);`
);

// also fix the products image usage
code = code.replace(
  /product\.image \?/g,
  `product.thumbnail ?`
);

code = code.replace(
  /src=\{product\.image\}/g,
  `src={product.thumbnail}`
);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
