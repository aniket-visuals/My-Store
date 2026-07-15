const fs = require('fs');

let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

const pages = [
  { url: '/', freq: 'daily', prio: '1.0' },
  { url: '/portal', freq: 'weekly', prio: '0.8' },
  { url: '/contact', freq: 'monthly', prio: '0.5' },
  { url: '/privacy', freq: 'monthly', prio: '0.5' },
  { url: '/terms', freq: 'monthly', prio: '0.5' }
];

pages.forEach(p => {
  sitemap += `
  <url>
    <loc>https://www.editorshubstore.in${p.url}</loc>
    <changefreq>${p.freq}</changefreq>
    <priority>${p.prio}</priority>
  </url>`;
});

const dataContent = fs.readFileSync('src/data.ts', 'utf8');
const slugRegex = /slug:\s*["']([^"']+)["']/g;
let match;
const seenSlugs = new Set();
while ((match = slugRegex.exec(dataContent)) !== null) {
  if (!seenSlugs.has(match[1])) {
    seenSlugs.add(match[1]);
    sitemap += `
  <url>
    <loc>https://www.editorshubstore.in/products/${match[1]}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
  }
}

sitemap += `\n</urlset>`;
fs.writeFileSync('public/sitemap.xml', sitemap);
