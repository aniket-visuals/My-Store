const fs = require('fs');

// Patch App.tsx
let appCode = fs.readFileSync('src/App.tsx', 'utf8');

if (!appCode.includes('import { updateMetaTags }')) {
  appCode = appCode.replace(
    'import { auth, db } from "./firebase";',
    'import { auth, db } from "./firebase";\nimport { updateMetaTags } from "./utils/seo";'
  );
  
  appCode = appCode.replace(
    /useEffect\(\(\) => \{\s+\/\/ Scroll to top on path change\s+window\.scrollTo\(\{ top: 0, behavior: "instant" as any \}\);\s+if \(location\.pathname === "\/"\) \{\s+document\.title = "Editors Hub Store — Professional Creative Assets for Editors & Designers";\s+const metaDesc = document\.querySelector\('meta\[name="description"\]'\);\s+if \(metaDesc\) \{\s+metaDesc\.setAttribute\('content', "Premium digital marketplace for video editors, motion designers, and content creators\."\);\s+\}\s+\}\s+\}, \[location\.pathname\]\);/,
    `useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as any });
    if (location.pathname === "/") {
      updateMetaTags({
        title: "Editors Hub Store — Professional Creative Assets for Editors & Designers",
        description: "Premium digital marketplace for video editors, motion designers, and content creators. High-quality assets, plugins, and sound effects to elevate your productions.",
        url: "https://www.editorshubstore.in/"
      });
    }
  }, [location.pathname]);`
  );
  
  // Update ProductRouteWrapper SEO logic
  appCode = appCode.replace(
    /useEffect\(\(\) => \{\s+if \(currentProduct\) \{\s+document\.title = `\$\{currentProduct\.name\} — Editors Hub Store`;\s+let metaDesc = document\.querySelector\('meta\[name="description"\]'\);[\s\S]*?\}\s+\}, \[currentProduct\]\);/,
    `useEffect(() => {
    if (currentProduct) {
      updateMetaTags({
        title: \`\${currentProduct.name} — Editors Hub Store\`,
        description: currentProduct.description.replace(/\\*\\*/g, ''),
        url: \`https://www.editorshubstore.in/products/\${currentProduct.slug}\`,
        image: currentProduct.image,
        type: "product"
      });
    }
  }, [currentProduct]);`
  );

  fs.writeFileSync('src/App.tsx', appCode);
}

// Patch PrivacyPolicy.tsx
let privacyCode = fs.readFileSync('src/components/PrivacyPolicy.tsx', 'utf8');
if (!privacyCode.includes('import { updateMetaTags }')) {
  privacyCode = privacyCode.replace(
    'import { useNavigate } from "react-router-dom";',
    'import { useNavigate } from "react-router-dom";\nimport { updateMetaTags } from "../utils/seo";'
  );
  privacyCode = privacyCode.replace(
    /useEffect\(\(\) => \{\s+document\.title = "Privacy Policy — Editors Hub Store";\s+const metaDesc = document\.querySelector\('meta\[name="description"\]'\);\s+if \(metaDesc\) \{\s+metaDesc\.setAttribute\('content', "Privacy Policy for Editors Hub Store\. Learn how we handle your data\."\);\s+\}\s+window\.scrollTo\(\{ top: 0, behavior: "instant" as any \}\);\s+\}, \[\]\);/,
    `useEffect(() => {
    updateMetaTags({
      title: "Privacy Policy — Editors Hub Store",
      description: "Privacy Policy for Editors Hub Store. Learn how we handle your data.",
      url: "https://www.editorshubstore.in/privacy"
    });
    window.scrollTo({ top: 0, behavior: "instant" as any });
  }, []);`
  );
  fs.writeFileSync('src/components/PrivacyPolicy.tsx', privacyCode);
}

// Patch TermsConditions.tsx
let termsCode = fs.readFileSync('src/components/TermsConditions.tsx', 'utf8');
if (!termsCode.includes('import { updateMetaTags }')) {
  termsCode = termsCode.replace(
    'import { useNavigate } from "react-router-dom";',
    'import { useNavigate } from "react-router-dom";\nimport { updateMetaTags } from "../utils/seo";'
  );
  termsCode = termsCode.replace(
    /useEffect\(\(\) => \{\s+document\.title = "Terms & Conditions — Editors Hub Store";\s+const metaDesc = document\.querySelector\('meta\[name="description"\]'\);\s+if \(metaDesc\) \{\s+metaDesc\.setAttribute\('content', "Terms & Conditions for Editors Hub Store\. Please read these terms carefully before using our website\."\);\s+\}\s+window\.scrollTo\(\{ top: 0, behavior: "instant" as any \}\);\s+\}, \[\]\);/,
    `useEffect(() => {
    updateMetaTags({
      title: "Terms & Conditions — Editors Hub Store",
      description: "Terms & Conditions for Editors Hub Store. Please read these terms carefully before using our website.",
      url: "https://www.editorshubstore.in/terms"
    });
    window.scrollTo({ top: 0, behavior: "instant" as any });
  }, []);`
  );
  fs.writeFileSync('src/components/TermsConditions.tsx', termsCode);
}

// Patch ContactPage.tsx
let contactCode = fs.readFileSync('src/components/ContactPage.tsx', 'utf8');
if (!contactCode.includes('import { updateMetaTags }')) {
  contactCode = contactCode.replace(
    'import { useNavigate } from "react-router-dom";',
    'import { useNavigate } from "react-router-dom";\nimport { updateMetaTags } from "../utils/seo";'
  );
  contactCode = contactCode.replace(
    /useEffect\(\(\) => \{\s+document\.title = "Contact Us — Editors Hub Store";\s+const metaDesc = document\.querySelector\('meta\[name="description"\]'\);\s+if \(metaDesc\) \{\s+metaDesc\.setAttribute\('content', "Get in touch with the Editors Hub Store team for support, business inquiries, or questions about our digital products\."\);\s+\}\s+window\.scrollTo\(\{ top: 0, behavior: "instant" as any \}\);\s+\}, \[\]\);/,
    `useEffect(() => {
    updateMetaTags({
      title: "Contact Us — Editors Hub Store",
      description: "Get in touch with the Editors Hub Store team for support, business inquiries, or questions about our digital products.",
      url: "https://www.editorshubstore.in/contact"
    });
    window.scrollTo({ top: 0, behavior: "instant" as any });
  }, []);`
  );
  fs.writeFileSync('src/components/ContactPage.tsx', contactCode);
}

