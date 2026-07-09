const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  `import React, { useState, useEffect } from "react";`,
  `import React, { useState, useEffect, Suspense, lazy } from "react";`
);

code = code.replace(
  `import ProductDetailPage from "./components/ProductDetailPage";
import AccountPortal from "./components/AccountPortal";
import CheckoutPage from "./components/CheckoutPage";
import ThankYouPage from "./components/ThankYouPage";
import AdminDashboard from "./components/AdminDashboard";`,
  `const ProductDetailPage = lazy(() => import("./components/ProductDetailPage"));
const AccountPortal = lazy(() => import("./components/AccountPortal"));
const CheckoutPage = lazy(() => import("./components/CheckoutPage"));
const ThankYouPage = lazy(() => import("./components/ThankYouPage"));
const AdminDashboard = lazy(() => import("./components/AdminDashboard"));`
);

code = code.replace(
  `      <main className="flex-1 overflow-x-hidden">
        <Routes location={location}>`,
  `      <main className="flex-1 overflow-x-hidden">
        <Suspense fallback={
          <div className="min-h-[50vh] flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        }>
        <Routes location={location}>`
);

code = code.replace(
  `        </Routes>
      </main>`,
  `        </Routes>
        </Suspense>
      </main>`
);

fs.writeFileSync('src/App.tsx', code);
