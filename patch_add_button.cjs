const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

code = code.replace(
  /onClick=\{\(\) => showToast\("Add Product flow is coming soon", "success"\)\}/,
  `onClick={() => {
          setEditingProduct({
            id: "",
            name: "",
            slug: "",
            shortDescription: "",
            fullDescription: "",
            category: "sound-effects",
            thumbnail: "",
            galleryImages: [],
            previewVideo: "",
            status: "Draft",
            priceUsd: 0,
            priceInr: 0,
            downloadLink: "",
            tutorialLink: "",
            metaTitle: "",
            metaDescription: ""
          });
          setCurrentPage("edit-product");
        }}`
);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
