import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation, useParams, Navigate } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { Product } from "./types";
import { PRODUCTS_DATA } from "./data";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import FeaturedProducts from "./components/FeaturedProducts";
import WhyChooseUs from "./components/WhyChooseUs";
import FaqSection from "./components/FaqSection";
import Footer from "./components/Footer";
import ProductDetailPage from "./components/ProductDetailPage";
import AccountPortal from "./components/AccountPortal";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

export default function App() {
  const [cart, setCart] = useState<Product[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsLoggedIn(true);
        setUserEmail(user.email || "");
        
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
    // Scroll to top on path change
    window.scrollTo({ top: 0, behavior: "instant" as any });

    if (location.pathname === "/") {
      document.title = "Editors Hub Store — Professional Creative Assets for Editors & Designers";
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', "Premium digital marketplace for video editors, motion designers, and content creators.");
      }
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

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col font-sans selection:bg-brand-primary/20">
      
      {/* 1. Header component */}
      {location.pathname !== "/portal" && (
        <Navbar
          cart={cart}
          removeFromCart={removeFromCart}
          clearCart={clearCart}
          openProductPreview={openProductPreview}
          scrollToSection={scrollToSection}
          isLoggedIn={isLoggedIn}
          setIsLoggedIn={setIsLoggedIn}
          userEmail={userEmail}
          setUserEmail={setUserEmail}
        />
      )}

      {/* 2. Interactive Main Canvas */}
      <main className="flex-1 overflow-x-hidden">
        <Routes location={location}>
          <Route path="/" element={
            <>
              {/* Full visual viewport showcase */}
              <Hero
                onExploreClick={() => scrollToSection("shop")}
              />

              {/* Bento features and Stats row combined */}
              <WhyChooseUs />

              {/* Active dynamic product list */}
              <FeaturedProducts
                cart={cart}
                addToCart={addToCart}
                openProductPreview={openProductPreview}
                activeCategory={activeCategory}
                setActiveCategory={setActiveCategory}
                wishlist={wishlist}
                toggleWishlist={toggleWishlist}
              />

              {/* Search accordion FAQ cards */}
              <FaqSection />
            </>
          } />

          <Route path="/products/:slug" element={
            <ProductRouteWrapper
              cart={cart}
              addToCart={addToCart}
              wishlist={wishlist}
              toggleWishlist={toggleWishlist}
            />
          } />

          <Route path="/portal" element={
            <div className="w-full">
              <AccountPortal
                onLoginStateChange={(loggedIn, email) => {
                  setIsLoggedIn(loggedIn);
                  setUserEmail(email);
                }}
                wishlist={wishlist}
                toggleWishlist={toggleWishlist}
              />
            </div>
          } />

          {/* Catch-all route to redirect back to main storefront */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* 3. Multi-column detailed footer */}
      {location.pathname !== "/portal" && (
        <Footer
          scrollToSection={scrollToSection}
          setActiveCategory={setActiveCategory}
        />
      )}

    </div>
  );
}

// Dynamic routing wrapper for product detail pages
function ProductRouteWrapper({
  cart,
  addToCart,
  wishlist,
  toggleWishlist
}: {
  cart: Product[];
  addToCart: (product: Product) => void;
  wishlist: Product[];
  toggleWishlist: (product: Product) => void;
}) {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  // Find product by slug or ID
  const currentProduct = PRODUCTS_DATA.find(
    (p) => p.slug === slug || p.id === slug
  );

  // Synchronize document titles and meta fields to be highly SEO-friendly
  useEffect(() => {
    if (currentProduct) {
      document.title = `${currentProduct.name} — Editors Hub Store`;

      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute('content', currentProduct.description.replace(/\*\*/g, ''));

      // Open Graph Metadata properties
      const ogProperties = [
        { property: "og:title", content: `${currentProduct.name} — Editors Hub Store` },
        { property: "og:description", content: currentProduct.description.replace(/\*\*/g, '') },
        { property: "og:image", content: currentProduct.image },
        { property: "og:type", content: "product" },
        { property: "og:url", content: window.location.href }
      ];

      ogProperties.forEach(({ property, content }) => {
        let metaTag = document.querySelector(`meta[property="${property}"]`);
        if (!metaTag) {
          metaTag = document.createElement("meta");
          metaTag.setAttribute("property", property);
          document.head.appendChild(metaTag);
        }
        metaTag.setAttribute("content", content);
      });
    }
  }, [currentProduct]);

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

  const inCart = cart.some((item) => item.id === currentProduct.id);

  return (
    <ProductDetailPage
      product={currentProduct}
      onBack={() => {
        navigate("/");
      }}
      addToCart={addToCart}
      inCart={inCart}
      wishlist={wishlist}
      toggleWishlist={toggleWishlist}
    />
  );
}
