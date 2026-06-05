import React, { useState } from "react";
import { Product } from "./types";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import FeaturedProducts from "./components/FeaturedProducts";
import WhyChooseUs from "./components/WhyChooseUs";
import FaqSection from "./components/FaqSection";
import Footer from "./components/Footer";
import ProductPreviewModal from "./components/ProductPreviewModal";

export default function App() {
  const [cart, setCart] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [selectedPreviewProduct, setSelectedPreviewProduct] = useState<Product | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Smooth scroll handler targeting sections on-page
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
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

  const openProductPreview = (product: Product) => {
    setSelectedPreviewProduct(product);
    setIsPreviewOpen(true);
  };

  const handleSelectCategoryFromWidget = (categorySlug: string) => {
    setActiveCategory(categorySlug);
    scrollToSection("shop");
  };

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col font-sans selection:bg-brand-primary/20">
      
      {/* 1. Header component */}
      <Navbar
        cart={cart}
        removeFromCart={removeFromCart}
        clearCart={clearCart}
        openProductPreview={openProductPreview}
        scrollToSection={scrollToSection}
      />

      {/* 2. Interactive Main Canvas */}
      <main className="flex-1">
        
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
        />

        {/* Search accordion FAQ cards */}
        <FaqSection />

      </main>

      {/* 3. Multi-column detailed footer */}
      <Footer
        scrollToSection={scrollToSection}
        setActiveCategory={setActiveCategory}
      />

      {/* 4. Shared Dynamic Media Preview Drawer (Hidden in background until triggered) */}
      {selectedPreviewProduct && (
        <ProductPreviewModal
          product={selectedPreviewProduct}
          isOpen={isPreviewOpen}
          onClose={() => {
            setIsPreviewOpen(false);
            setSelectedPreviewProduct(null);
          }}
          addToCart={addToCart}
          inCart={cart.some((item) => item.id === selectedPreviewProduct.id)}
        />
      )}

    </div>
  );
}
