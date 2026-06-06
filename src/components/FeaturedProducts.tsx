import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Star, Download, Play, ShoppingCart, X, Check, Volume2, Film, FileCode, Eye, Sparkles, AlertCircle } from "lucide-react";
import { Product } from "../types";
import { PRODUCTS_DATA, CATEGORIES_DATA } from "../data";

interface FeaturedProductsProps {
  cart: Product[];
  addToCart: (product: Product) => void;
  openProductPreview: (product: Product) => void;
  activeCategory: string;
  setActiveCategory: (category: string) => void;
}

export default function FeaturedProducts({
  cart,
  addToCart,
  openProductPreview,
  activeCategory,
  setActiveCategory
}: FeaturedProductsProps) {
  
  // Filter products by selected category slug
  const filteredProducts = activeCategory === "all"
    ? PRODUCTS_DATA
    : PRODUCTS_DATA.filter((p) => p.category === activeCategory);

  // Helper check to see if item is already inside cart list
  const isItemInCart = (productId: string) => {
    return cart.some((p) => p.id === productId);
  };

  return (
    <section id="shop" className="py-20 xl:py-28 bg-brand-bg">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <p className="text-xs font-mono font-bold uppercase tracking-widest text-brand-primary">
            Digital Asset Store
          </p>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-black tracking-tight">
            Best-Selling Asset Kits
          </h2>
        </div>

        {/* Filter Categories Horizontal Scrollable Ribbon */}
        <div className="flex items-center justify-start xl:justify-center overflow-x-auto pb-6 scrollbar-thin scrollbar-thumb-black/5 gap-2.5 max-w-full">
          <button
            onClick={() => setActiveCategory("all")}
            className={`px-5 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
              activeCategory === "all"
                ? "bg-brand-primary text-white font-bold"
                : "bg-white text-black/60 border border-black/5 hover:text-black hover:border-black/15"
            }`}
          >
            All Products
          </button>
          
          {CATEGORIES_DATA.map((cat) => (
            <button
               key={cat.id}
              onClick={() => setActiveCategory(cat.slug)}
              className={`px-5 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
                activeCategory === cat.slug
                  ? "bg-brand-primary text-white font-bold"
                  : "bg-white text-black/60 border border-black/5 hover:text-black hover:border-black/15"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Products Showcase Grid */}
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12"
        >
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((product) => {
              const inCart = isItemInCart(product.id);

              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4 }}
                  key={product.id}
                  className="bg-white rounded-3xl border border-black/5 overflow-hidden group hover:shadow-2xl hover:border-black/10 transition-all flex flex-col justify-between"
                >
                  
                  {/* Aspect Ratio Preview container */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-black/5 shrink-0">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    
                    {/* Dark gradient vignette edge */}
                    <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />

                    {/* Pop item sticker badge */}
                    {product.isPopular && (
                      <div className="absolute top-4 left-4 bg-black/85 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-mono font-bold text-white tracking-widest uppercase flex items-center gap-1 border border-white/5 shadow-sm">
                        <Sparkles className="w-2.5 h-2.5 text-brand-primary font-extrabold" />
                        <span>Best Seller</span>
                      </div>
                    )}

                    {/* Format file type sticker badge */}
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold text-black border border-black/5 shadow-sm">
                      {product.fileType.split("/")[0]}
                    </div>

                    {/* Floating quick viewport preview icon button */}
                    <button
                      onClick={() => openProductPreview(product)}
                      className="absolute bottom-4 right-4 bg-white text-black w-9 h-9 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95 cursor-pointer"
                      title="Quick preview details"
                    >
                      <Eye className="w-4 h-4 stroke-[2]" />
                    </button>
                    
                    {/* Downloads count ticker */}
                    <div className="absolute bottom-4 left-4 flex items-center space-x-1 font-mono text-[10px] text-white/95">
                      <Download className="w-3 h-3" />
                      <span>{product.downloadCount.toLocaleString()} downloads</span>
                    </div>

                  </div>

                  {/* Pricing and Details Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Meta Tags */}
                      <p className="text-[10px] uppercase font-mono tracking-widest text-brand-primary font-bold">
                        {product.category.replace("-", " ")}
                      </p>

                      <h3 className="font-display font-bold text-lg text-black mt-2 leading-snug group-hover:text-brand-primary transition-colors">
                        {product.name}
                      </h3>

                      <p className="text-xs text-black/50 font-sans mt-3 line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>
                    </div>

                    <div className="mt-6 pt-5 border-t border-black/5 flex flex-col gap-4">
                      
                      {/* Info and Price line */}
                      <div className="flex items-center justify-between">
                        
                        {/* Rating row */}
                        <div className="flex items-center space-x-1">
                          <Star className="w-3.5 h-3.5 fill-brand-primary stroke-transparent" />
                          <span className="text-xs font-bold font-mono text-black">
                            {product.rating}
                          </span>
                          <span className="text-xs text-black/30 font-mono">
                            ({product.reviewsCount} reviews)
                          </span>
                        </div>

                        {/* Price label */}
                        <div className="flex items-center space-x-2">
                          {product.originalPrice && (
                            <span className="text-xs text-black/30 line-through font-mono font-bold">
                              ${product.originalPrice}
                            </span>
                          )}
                          <span className="font-display font-bold text-lg text-black">
                            ${product.price}
                          </span>
                        </div>

                      </div>

                      {/* Immediate Buttons row */}
                      <div className="grid grid-cols-1 shrink-0">
                        <button
                          onClick={() => openProductPreview(product)}
                          className="w-full bg-brand-primary hover:bg-brand-accent text-white py-3.5 px-4 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer text-center flex items-center justify-center space-x-2 tracking-wider uppercase font-mono shadow-[0_4px_20px_-4px_rgba(252,115,1,0.35)] hover:shadow-[0_8px_24px_rgba(252,115,1,0.5)] active:scale-[0.98]"
                        >
                          <span>Get Access</span>
                        </button>
                      </div>

                    </div>
                  </div>

                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {/* Empty filter fallbacks */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border border-black/5 mt-12 p-8 overflow-hidden">
            <div className="w-12 h-12 bg-brand-primary/10 text-brand-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-lg text-black">No assets found</h3>
            <p className="text-sm text-black/50 mt-1">Our designers are currently compiling and mastering packages for this collection.</p>
            <button
              onClick={() => setActiveCategory("all")}
              className="mt-6 text-xs bg-brand-primary text-white px-6 py-2.5 rounded-full font-semibold hover:bg-brand-accent"
            >
              Reset Filters
            </button>
          </div>
        )}

      </div>
    </section>
  );
}
