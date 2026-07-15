const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

code = code.replace(
  `<meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Editors Hub Store</title>`,
  `<meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <!-- Primary Meta Tags -->
    <title>Editors Hub Store — Professional Creative Assets for Editors & Designers</title>
    <meta name="title" content="Editors Hub Store — Professional Creative Assets for Editors & Designers">
    <meta name="description" content="Premium digital marketplace for video editors, motion designers, and content creators. High-quality assets, plugins, and sound effects to elevate your productions.">
    
    <!-- Canonical URL -->
    <link rel="canonical" href="https://www.editorshubstore.in/">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://www.editorshubstore.in/">
    <meta property="og:title" content="Editors Hub Store — Professional Creative Assets for Editors & Designers">
    <meta property="og:description" content="Premium digital marketplace for video editors, motion designers, and content creators. High-quality assets, plugins, and sound effects to elevate your productions.">
    <meta property="og:image" content="https://res.cloudinary.com/df5rgwdng/image/upload/v1782835978/Logo_A_yl3rjd.png">
    
    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="https://www.editorshubstore.in/">
    <meta property="twitter:title" content="Editors Hub Store — Professional Creative Assets for Editors & Designers">
    <meta property="twitter:description" content="Premium digital marketplace for video editors, motion designers, and content creators. High-quality assets, plugins, and sound effects to elevate your productions.">
    <meta property="twitter:image" content="https://res.cloudinary.com/df5rgwdng/image/upload/v1782835978/Logo_A_yl3rjd.png">
    <meta name="twitter:creator" content="@Ankitxed">

    <!-- Structured Data JSON-LD -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "Store",
      "name": "Editors Hub Store",
      "image": "https://res.cloudinary.com/df5rgwdng/image/upload/v1782835978/Logo_A_yl3rjd.png",
      "url": "https://www.editorshubstore.in",
      "telephone": "",
      "priceRange": "$",
      "description": "Premium digital marketplace for video editors, motion designers, and content creators. High-quality assets, plugins, and sound effects to elevate your productions."
    }
    </script>`
);

fs.writeFileSync('index.html', code);
