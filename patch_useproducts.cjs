const fs = require('fs');
let code = fs.readFileSync('src/hooks/useProducts.ts', 'utf8');

code = code.replace(
  /id: doc\.id,[\s\S]*?\} as Product;/,
  `id: doc.id,
            name: data.name,
            slug: data.slug,
            price: data.priceUsd,
            priceInr: data.priceInr,
            originalPrice: data.priceUsd * 1.5,
            category: data.category,
            rating: 5.0,
            reviewsCount: 0,
            downloadCount: 0,
            description: data.shortDescription || data.fullDescription || "",
            fullDescription: data.fullDescription,
            features: [],
            compatibility: "Any NLE",
            fileSize: "N/A",
            fileType: "ZIP",
            image: data.thumbnail,
            galleryImages: data.galleryImages || [],
            videoPreview: data.previewVideo,
            downloadLink: data.downloadLink,
            tutorialLink: data.tutorialLink,
            metaTitle: data.metaTitle,
            metaDescription: data.metaDescription,
            isPopular: false,
            releaseDate: data.createdAt ? new Date(data.createdAt.seconds * 1000).toLocaleDateString() : new Date().toLocaleDateString()
          } as Product;`
);

fs.writeFileSync('src/hooks/useProducts.ts', code);
