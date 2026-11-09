// Dynamic SEO & OpenGraph Meta Injector for Product and Cloaked Links
// Fetches product details via Firestore REST API to inject the product's
// thumbnail image, title, and description into HTML for social crawlers
// (Telegram, WhatsApp, Discord, Twitter/X, Facebook, LinkedIn, Slack).

const PROJECT_ID = process.env.WEBSITE_FIREBASE_PROJECT_ID || "editors-hub-store";
const DEFAULT_TITLE = "Editors Hub Store — Professional Creative Assets for Editors & Designers";
const DEFAULT_DESC = "Premium digital marketplace for video editors, motion designers, and content creators. High-quality assets, plugins, and sound effects to elevate your productions.";
const DEFAULT_IMAGE = "https://res.cloudinary.com/df5rgwdng/image/upload/v1782835978/Logo_A_yl3rjd.png";
const SITE_URL = "https://www.editorshubstore.in";

export interface ProductSeoMeta {
  title: string;
  description: string;
  image: string;
  url: string;
  price?: number;
  name?: string;
}

function escapeHtmlAttr(str: string): string {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function stripMarkdown(str: string): string {
  return String(str || "")
    .replace(/\*\*/g, "")
    .replace(/[#*_`~>]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export async function getProductSeoBySlug(slug: string): Promise<ProductSeoMeta | null> {
  if (!slug) return null;
  const cleanSlug = decodeURIComponent(slug).trim().toLowerCase();

  try {
    const endpoint = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/products?pageSize=100`;
    const response = await fetch(endpoint);
    if (!response.ok) return null;

    const data: any = await response.json();
    const docs: any[] = data.documents || [];

    for (const doc of docs) {
      const docId = (doc.name || "").split("/").pop() || "";
      const fields = doc.fields || {};
      const itemSlug = (fields.slug?.stringValue || "").trim();
      const status = (fields.status?.stringValue || "Published").trim();

      if (status !== "Published") continue;

      if (
        itemSlug.toLowerCase() === cleanSlug ||
        docId.toLowerCase() === cleanSlug
      ) {
        const name = (fields.name?.stringValue || itemSlug || "Creative Asset").trim();
        const metaTitle = (fields.metaTitle?.stringValue || "").trim();
        const metaDescription = (fields.metaDescription?.stringValue || "").trim();
        const shortDesc = (fields.shortDescription?.stringValue || "").trim();
        const fullDesc = (fields.fullDescription?.stringValue || "").trim();
        const thumbnail = (fields.thumbnail?.stringValue || "").trim();
        const priceUsd =
          fields.priceUsd?.doubleValue ??
          (fields.priceUsd?.integerValue ? Number(fields.priceUsd.integerValue) : undefined);

        const rawDesc = metaDescription || shortDesc || fullDesc || DEFAULT_DESC;
        const cleanDesc = stripMarkdown(rawDesc).slice(0, 220);

        return {
          name,
          title: metaTitle || `${name} — Editors Hub Store`,
          description: cleanDesc || DEFAULT_DESC,
          image: thumbnail || DEFAULT_IMAGE,
          url: `${SITE_URL}/products/${itemSlug || docId}`,
          price: priceUsd
        };
      }
    }
  } catch (err) {
    console.error("Failed to fetch product SEO metadata:", err);
  }

  return null;
}

export function injectProductMetaIntoHtml(html: string, meta: ProductSeoMeta): string {
  const safeTitle = escapeHtmlAttr(meta.title);
  const safeDesc = escapeHtmlAttr(meta.description);
  const safeImg = escapeHtmlAttr(meta.image);
  const safeUrl = escapeHtmlAttr(meta.url);

  let updated = html;

  // Replace <title>
  updated = updated.replace(/<title>[\s\S]*?<\/title>/i, `<title>${safeTitle}</title>`);

  // Replace primary meta title & description
  updated = updated.replace(
    /<meta\s+name="title"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="title" content="${safeTitle}">`
  );
  updated = updated.replace(
    /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="description" content="${safeDesc}">`
  );

  // Replace Canonical link
  updated = updated.replace(
    /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i,
    `<link rel="canonical" href="${safeUrl}">`
  );

  // Replace Open Graph tags
  updated = updated.replace(
    /<meta\s+property="og:type"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:type" content="product">`
  );
  updated = updated.replace(
    /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:url" content="${safeUrl}">`
  );
  updated = updated.replace(
    /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:title" content="${safeTitle}">`
  );
  updated = updated.replace(
    /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:description" content="${safeDesc}">`
  );
  updated = updated.replace(
    /<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:image" content="${safeImg}">\n    <meta property="og:image:secure_url" content="${safeImg}">\n    <meta property="og:image:alt" content="${safeTitle}">`
  );

  // Replace Twitter Card tags (support both name="twitter:*" and property="twitter:*")
  updated = updated.replace(
    /<meta\s+(?:name|property)="twitter:url"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="twitter:url" content="${safeUrl}">`
  );
  updated = updated.replace(
    /<meta\s+(?:name|property)="twitter:title"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="twitter:title" content="${safeTitle}">`
  );
  updated = updated.replace(
    /<meta\s+(?:name|property)="twitter:description"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="twitter:description" content="${safeDesc}">`
  );
  updated = updated.replace(
    /<meta\s+(?:name|property)="twitter:image"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="twitter:image" content="${safeImg}">`
  );

  // Replace JSON-LD structured data with Product schema
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: meta.name || meta.title,
    image: meta.image,
    description: meta.description,
    url: meta.url,
    brand: {
      "@type": "Brand",
      name: "Editors Hub Store"
    },
    ...(typeof meta.price === "number"
      ? {
          offers: {
            "@type": "Offer",
            price: String(meta.price),
            priceCurrency: "USD",
            availability: "https://schema.org/InStock",
            url: meta.url
          }
        }
      : {})
  };

  updated = updated.replace(
    /<script\s+type="application\/ld\+json">[\s\S]*?<\/script>/i,
    `<script type="application/ld+json">\n${JSON.stringify(productSchema, null, 2)}\n    </script>`
  );

  return updated;
}

export function buildFallbackProductHtml(meta?: ProductSeoMeta | null): string {
  const title = escapeHtmlAttr(meta?.title || DEFAULT_TITLE);
  const desc = escapeHtmlAttr(meta?.description || DEFAULT_DESC);
  const img = escapeHtmlAttr(meta?.image || DEFAULT_IMAGE);
  const url = escapeHtmlAttr(meta?.url || `${SITE_URL}/`);

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
    <meta name="title" content="${title}">
    <meta name="description" content="${desc}">
    <link rel="canonical" href="${url}">
    <meta property="og:type" content="product">
    <meta property="og:url" content="${url}">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${desc}">
    <meta property="og:image" content="${img}">
    <meta property="og:image:secure_url" content="${img}">
    <meta property="og:image:alt" content="${title}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:url" content="${url}">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${desc}">
    <meta name="twitter:image" content="${img}">
    <meta name="twitter:creator" content="@Ankitxed">
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`;
}
