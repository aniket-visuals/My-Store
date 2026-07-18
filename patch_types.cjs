const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf8');

code = code.replace(
  /export interface Product \{[\s\S]*?releaseDate\?: string;\n\}/,
  `export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  priceInr?: number;
  originalPrice?: number;
  category: string;
  rating: number;
  reviewsCount: number;
  downloadCount: number;
  description: string;
  fullDescription?: string;
  features: string[];
  compatibility: string;
  fileSize: string;
  fileType: string;
  image: string;
  galleryImages?: string[];
  videoPreview?: string;
  audioPreview?: string;
  downloadLink?: string;
  tutorialLink?: string;
  metaTitle?: string;
  metaDescription?: string;
  isPopular?: boolean;
  releaseDate?: string;
}`
);

fs.writeFileSync('src/types.ts', code);
