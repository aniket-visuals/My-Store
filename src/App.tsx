import React, { useState, useEffect, Suspense, lazy } from "react";
import { Routes, Route, useNavigate, useLocation, useParams, Navigate } from "react-router-dom";
import { Product } from "./types";
import { useProducts } from "./hooks/useProducts";
import { useSiteAnalytics } from "./hooks/useSiteAnalytics";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import FeaturedProducts from "./components/FeaturedProducts";
import FaqSection from "./components/FaqSection";
import Footer from "./components/Footer";
const ProductDetailPage = lazy(() => import("./components/ProductDetailPage"));
const AccountPortal = lazy(() => import("./components/AccountPortal"));
const CheckoutPage = lazy(() => import("./components/CheckoutPage"));
const ThankYouPage = lazy(() => import("./components/ThankYouPage"));
const AdminDashboard = lazy(() => import("./components/AdminDashboard"));
const PrivacyPolicy = lazy(() => import("./components/PrivacyPolicy"));
const TermsConditions = lazy(() => import("./components/TermsConditions"));
const RefundPolicy = lazy(() => import("./components/RefundPolicy"));
const AboutPage = lazy(() => import("./components/AboutPage"));
const ContactPage = lazy(() => import("./components/ContactPage"));
const RedirectHandler = lazy(() => import("./components/RedirectHandler"));
import LoadingScreen from "./components/LoadingScreen";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import { updateMetaTags } from "./utils/seo";


// Cookie Notice Component

export default function App() {
  useSiteAnalytics();
  const { products, loading: isLoadingProducts } = useProducts();
  const [cart, setCart] = useState<Product[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsLoggedIn(true);
        setUserEmail(user.email || "");
        
        // Auto-bootstrap original admin
        if (user.email === 'aniketrajcargal123@gmail.com') {
          try {
            await setDoc(doc(db, "admins", user.uid), { email: user.email, role: 'admin' }, { merge: true });
          } catch (e) {
            console.error("Failed to bootstrap admin:", e);
          }
        }
        
        try {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.wishlist) {
              setWishlist(data.wishlist);
            }
          }
        } catch (err) {
          console.error("Error loading wishlist from Firebase:", err);
        }
      } else {
        setIsLoggedIn(false);
        setUserEmail("");
        setWishlist([]);
      }
    });
    return () => unsubscribe();
  }, []);

  // Reset standard titles and meta description when returning to home page
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as any });
    if (location.pathname === "/") {
      updateMetaTags({
        title: "Editors Hub Store — Professional Creative Assets for Editors & Designers",
        description: "Premium digital marketplace for video editors, motion designers, and content creators. High-quality assets, plugins, and sound effects to elevate your productions.",
        url: "https://www.editorshubstore.in/"
      });
    }
  }, [location.pathname]);

  // Smooth scroll handler targeting sections on-page
  const scrollToSection = (id: string) => {
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 150);
    } else {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  // Cart addition pipeline
  const addToCart = (product: Product) => {
    setCart((prev) => {
      const exists = prev.some((item) => item.id === product.id);
      if (exists) return prev;
      return [...prev, product];
    });
  };

  // Remove single line item out of active state
  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  // Clear checkout cart context upon order compilation
  const clearCart = () => {
    setCart([]);
  };

  // Wishlist pipeline
  const toggleWishlist = async (product: Product) => {
    const exists = wishlist.some((item) => item.id === product.id);
    const newWishlist = exists 
      ? wishlist.filter((item) => item.id !== product.id)
      : [...wishlist, product];
      
    setWishlist(newWishlist);

    if (auth.currentUser) {
      try {
        await setDoc(doc(db, "users", auth.currentUser.uid), { wishlist: newWishlist }, { merge: true });
      } catch (err) {
        console.error("Error saving wishlist to Firebase:", err);
      }
    }
  };

  const openProductPreview = (product: Product) => {
    navigate(`/products/${product.slug}`);
  };

  const isRedirectPage = location.pathname.startsWith("/l/") || location.pathname.startsWith("/go/");

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col font-sans selection:bg-brand-primary/20">
      
      {/* 1. Header component */}
      {!isRedirectPage && (
        <Navbar cart={cart} 
          removeFromCart={removeFromCart}
          clearCart={clearCart}
          openProductPreview={openProductPreview}
          scrollToSection={scrollToSection}
          isLoggedIn={isLoggedIn}
          
          userEmail={userEmail}
          
          
        />
      )}

      {/* 2. Interactive Main Canvas */}
      <main className="flex-1 overflow-x-hidden">
        <Suspense fallback={<LoadingScreen />}>
        <Routes location={location}>
          <Route path="/" element={
            <>
              {/* Full visual viewport showcase */}
              <Hero />

              {/* Active dynamic product list */}
              <FeaturedProducts      
                openProductPreview={openProductPreview}
                wishlist={wishlist} 
                toggleWishlist={toggleWishlist}
              />

              {/* Search accordion FAQ cards */}
              <FaqSection />
            </>
          } />

          <Route path="/products/:slug" element={
            <ProductRouteWrapper
              products={products}
              isLoadingProducts={isLoadingProducts}
              addToCart={addToCart} 
              wishlist={wishlist} 
              toggleWishlist={toggleWishlist}
            />
          } />

          <Route path="/portal" element={
            <>
              <Hero />
              <FeaturedProducts
                openProductPreview={openProductPreview}
                wishlist={wishlist} 
                toggleWishlist={toggleWishlist}
              />
              <FaqSection />
              
              {/* Overlay portal on top */}
              <div 
                className="fixed inset-0 z-[100] bg-black/20 backdrop-blur-sm overflow-y-auto w-full flex flex-col"
                onClick={(e) => {
                  // Only navigate back if the user clicked directly on the overlay, not on the children
                  if (e.target === e.currentTarget) {
                    navigate("/");
                  }
                }}
              >
                <AccountPortal
                  onLoginStateChange={(loggedIn, email) => {
                    setIsLoggedIn(loggedIn);
                    setUserEmail(email);
                  }}
                  addToCart={addToCart} wishlist={wishlist} toggleWishlist={toggleWishlist}
                />
              </div>
            </>
          } />

          {/* Dedicated Cloaked Link Redirect Routes */}
          <Route path="/l/:slug" element={<RedirectHandler />} />
          <Route path="/go/:slug" element={<RedirectHandler />} />

          {/* Catch-all route to redirect back to main storefront */}
          <Route path="/checkout" element={<CheckoutPage cart={cart} clearCart={clearCart} />} />
          <Route path="/thank-you" element={<ThankYouPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsConditions />} />
              <Route path="/refund" element={<RefundPolicy />} />
              <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </Suspense>
      </main>

      {/* 3. Multi-column detailed footer */}
      {location.pathname !== "/admin" && !isRedirectPage && (
        <Footer
          scrollToSection={scrollToSection}
        />
      )}

    </div>
  );
}

// Dynamic routing wrapper for product detail pages
function ProductRouteWrapper({
  addToCart,
  wishlist,
  toggleWishlist,
  products,
  isLoadingProducts
}: {
  addToCart: (product: Product) => void;
  wishlist: Product[];
  toggleWishlist: (product: Product) => void;
  products: Product[];
  isLoadingProducts: boolean;
}) {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  // Find product by slug or ID
  const currentProduct = products.find(
    (p) => p.slug === slug || p.id === slug
  );

  // Synchronize document titles and meta fields to be highly SEO-friendly
  useEffect(() => {
    if (currentProduct) {
      updateMetaTags({
        title: `${currentProduct.name} — Editors Hub Store`,
        description: currentProduct.description.replace(/\*\*/g, ''),
        url: `https://www.editorshubstore.in/products/${currentProduct.slug}`,
        image: currentProduct.image,
        type: "product"
      });
    }
  }, [currentProduct]);

  if (isLoadingProducts) {
    return <LoadingScreen fullScreen={true} message="Locating creative asset..." />;
  }

  if (!currentProduct) {
    return (
      <div className="py-32 text-center space-y-4 max-w-md mx-auto px-6">
        <h2 className="font-display font-bold text-2xl text-black">Product Not Found</h2>
        <p className="text-sm text-black/50 leading-relaxed font-sans">
          The creative asset you are looking for does not exist or has been moved.
        </p>
        <button
          onClick={() => {
            navigate("/");
          }}
          className="px-6 py-2.5 bg-brand-primary hover:bg-brand-accent text-white rounded-xl font-bold font-mono text-xs uppercase tracking-wider transition-colors cursor-pointer select-none"
        >
          Back to Store
        </button>
      </div>
    );
  }


  return (
    <ProductDetailPage  
      product={currentProduct}
      onBack={() => navigate("/")}
      addToCart={addToCart} 
      wishlist={wishlist} 
      toggleWishlist={toggleWishlist}
    />
  );
}
