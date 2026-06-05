import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, ShoppingCart, Menu, X, ArrowRight, Sparkles, User, Check, Download } from "lucide-react";
import { Product } from "../types";
import { PRODUCTS_DATA } from "../data";

interface NavbarProps {
  cart: Product[];
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  openProductPreview: (product: Product) => void;
  scrollToSection: (id: string) => void;
}

export default function Navbar({
  cart,
  removeFromCart,
  clearCart,
  openProductPreview,
  scrollToSection
}: NavbarProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isGetStartedOpen, setIsGetStartedOpen] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [copiedKit, setCopiedKit] = useState(false);

  // Filter products based on search query
  const filteredProducts = searchQuery.trim()
    ? PRODUCTS_DATA.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : PRODUCTS_DATA.slice(0, 3); // Quick suggestions

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsLoggedIn(true);
      setUserEmail(emailInput);
      setIsLoginOpen(false);
    }, 1200);
  };

  const handleSignout = () => {
    setIsLoggedIn(false);
    setUserEmail("");
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText("https://aniketvisuals.com/free-starter-kit");
    setCopiedKit(true);
    setTimeout(() => setCopiedKit(false), 2000);
  };

  const handleCheckout = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      alert("Demo Order Processed Successfully! Your files have been compiled. In a real environment, this starts your cloud downloads instantly.");
      clearCart();
      setIsCartOpen(false);
    }, 1500);
  };

  return (
    <header className="sticky top-0 z-50 bg-brand-bg/80 backdrop-blur-md border-b border-black/5">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <button
          onClick={() => scrollToSection("hero")}
          className="flex items-center space-x-3 group cursor-pointer"
        >
          <div className="w-10 h-10 flex items-center justify-center shrink-0 relative overflow-hidden rounded-lg">
            <img 
              src="https://res.cloudinary.com/df5rgwdng/image/upload/v1773434133/looooo_y1n4b3.png"
              alt="Editors Raj Logo"
              className="w-full h-full object-cover origin-center group-hover:scale-110 transition-transform duration-300"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="flex flex-col items-start translate-y-[1px]">
            <span className="font-display font-bold tracking-tight text-lg text-black leading-none">
              Editors Raj
            </span>
            <span className="text-[10px] uppercase tracking-widest font-mono text-black/40 mt-1">
              Creative Assets
            </span>
          </div>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <button
            onClick={() => scrollToSection("hero")}
            className="text-sm font-medium text-black/60 hover:text-black transition-colors cursor-pointer"
          >
            Home
          </button>
          <button
            onClick={() => scrollToSection("shop")}
            className="text-sm font-medium text-black/60 hover:text-black transition-colors cursor-pointer"
          >
            Shop
          </button>
          <button
            onClick={() => scrollToSection("why-us")}
            className="text-sm font-medium text-black/60 hover:text-black transition-colors cursor-pointer"
          >
            About
          </button>
          <button
            onClick={() => scrollToSection("faq")}
            className="text-sm font-medium text-black/60 hover:text-black transition-colors cursor-pointer"
          >
            FAQ
          </button>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center space-x-4">
          {/* Spotlight Search Toggle */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-black/5 transition-colors text-black/80"
            title="Search assets"
          >
            <Search className="w-5 h-5 stroke-[1.8]" />
          </button>

          {/* Primary CTA */}
          <button
            onClick={() => scrollToSection("shop")}
            className="hidden lg:flex items-center space-x-2 bg-brand-primary text-white text-xs font-semibold px-5 py-2.5 rounded-full hover:bg-brand-accent transition-all shadow-sm cursor-pointer"
          >
            <span>Explore Assets</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          {/* Mobile Menu Icon */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden w-10 h-10 rounded-full flex items-center justify-center hover:bg-black/5 transition-colors text-black"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* --- MODALS & DRAWER REVIEWS --- */}

      {/* SEARCH SPOTLIGHT OVERLAY */}
      <AnimatePresence>
        {isSearchOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSearchOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, y: -20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: -20, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-black/5 overflow-hidden"
            >
              <div className="flex items-center px-5 border-b border-black/5 h-16">
                <Search className="w-5 h-5 text-black/40 mr-3 shrink-0" />
                <input
                  type="text"
                  placeholder="Search Premiere LUTs, After Effects, Sound Rises..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent border-none text-black placeholder-black/30 outline-none text-base"
                  autoFocus
                />
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="text-xs bg-black/5 px-2.5 py-1.5 rounded-md text-black/60 hover:bg-black/10"
                >
                  ESC
                </button>
              </div>

              <div className="p-4 max-h-[360px] overflow-y-auto">
                <p className="text-[10px] text-black/40 font-mono uppercase tracking-wider mb-3 px-2">
                  {searchQuery ? "Search Results" : "Top Assets Today"}
                </p>

                <div className="space-y-1">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => {
                        setIsSearchOpen(false);
                        openProductPreview(product);
                      }}
                      className="flex items-center justify-between p-2 rounded-xl hover:bg-black/5 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center space-x-3">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-10 h-10 rounded-lg object-cover bg-black/5"
                        />
                        <div>
                          <p className="text-sm font-semibold text-black leading-tight">
                            {product.name}
                          </p>
                          <p className="text-[11px] text-black/50 mt-0.5">
                            {product.fileType} • {product.fileSize}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-semibold px-3 py-1 rounded-full bg-brand-bg border border-black/5">
                        ${product.price}
                      </span>
                    </div>
                  ))}

                  {filteredProducts.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-sm text-black/50">No assets match "{searchQuery}"</p>
                      <button
                        onClick={() => setSearchQuery("")}
                        className="text-xs text-black font-semibold mt-2 underline"
                      >
                        Reset search filter
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="py-3 px-5 border-t border-black/5 bg-brand-bg flex justify-between items-center text-xs text-black/50">
                <span>Select an asset to view quick file details & play preview</span>
                <span className="font-mono">Editors Raj v1.0.4</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SHOPPING CART DRAWER */}
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10"
            >
              <div className="h-20 border-b border-black/5 px-6 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <ShoppingCart className="w-5 h-5 text-black" />
                  <span className="font-display font-bold text-lg text-black">Your Cart</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-black/5 font-mono">
                    {cart.length}
                  </span>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/5 text-black"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {cart.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="w-12 h-12 rounded-full bg-brand-bg flex items-center justify-center mx-auto mb-4 border border-black/5">
                      <ShoppingCart className="w-6 h-6 text-black/40" />
                    </div>
                    <p className="text-sm font-semibold text-black">Your cart is empty</p>
                    <p className="text-xs text-black/50 mt-1 max-w-[200px] mx-auto">
                      Explore our premium marketplace assets and speed up your workflow today.
                    </p>
                    <button
                      onClick={() => {
                        setIsCartOpen(false);
                        scrollToSection("shop");
                      }}
                      className="mt-6 text-xs font-semibold uppercase tracking-wider bg-brand-primary text-white px-6 py-2.5 rounded-full hover:bg-brand-accent"
                    >
                      Shop Assets Now
                    </button>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start space-x-4 p-3 rounded-xl border border-black/5 hover:border-black/10 transition-all group"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 rounded-lg object-cover bg-black/5 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-black leading-snug truncate">
                          {item.name}
                        </p>
                        <p className="text-[11px] text-black/40 font-mono mt-0.5">
                          {item.fileType} • {item.fileSize}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm font-semibold">${item.price}</span>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-xs text-brand-accent hover:underline font-mono"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div className="border-t border-black/10 bg-brand-bg p-6 space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-black/60">Subtotal</span>
                    <span className="font-bold text-black text-lg">
                      ${cart.reduce((total, p) => total + p.price, 0)}
                    </span>
                  </div>
                  <div className="text-[11px] text-black/50 text-center flex items-center justify-center gap-1.5 font-mono">
                    <Check className="w-3.5 h-3.5 text-brand-primary shrink-0" />
                    Instant file download triggers upon payment complete
                  </div>

                  <button
                    onClick={handleCheckout}
                    disabled={isSubmitting}
                    className="w-full bg-brand-primary text-white py-3.5 rounded-full font-semibold hover:bg-brand-accent transition-colors flex items-center justify-center space-x-2.5"
                  >
                    <span>{isSubmitting ? "Processing secure path..." : "Complete Checkout"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MOBILE EXPANDED MENU DRAWER */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.25 }}
              className="relative w-72 bg-white h-full flex flex-col z-10"
            >
              <div className="h-20 border-b border-black/5 px-6 flex items-center justify-between">
                <span className="font-display font-bold text-lg text-black">Menu Navigation</span>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/5 text-black"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 px-6 py-8 space-y-6 flex flex-col">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    scrollToSection("hero");
                  }}
                  className="text-left font-display font-bold text-xl text-black hover:opacity-75 transition-opacity"
                >
                  Home
                </button>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    scrollToSection("shop");
                  }}
                  className="text-left font-display font-bold text-xl text-black hover:opacity-75 transition-opacity"
                >
                  Shop Assets
                </button>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    scrollToSection("why-us");
                  }}
                  className="text-left font-display font-bold text-xl text-black hover:opacity-75 transition-opacity"
                >
                  About Studio
                </button>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    scrollToSection("faq");
                  }}
                  className="text-left font-display font-bold text-xl text-black hover:opacity-75 transition-opacity"
                >
                  FAQ
                </button>

                <hr className="border-black/5 my-4" />

                {isLoggedIn ? (
                  <div className="space-y-4">
                    <p className="text-xs text-black/50 font-mono">Logged in as {userEmail}</p>
                    <button
                      onClick={() => {
                        handleSignout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full text-center border border-brand-accent text-brand-accent py-2.5 rounded-full text-xs font-semibold"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsLoginOpen(true);
                    }}
                    className="w-full text-center border border-black/10 py-2.5 rounded-full text-xs font-semibold"
                  >
                    Partner Login
                  </button>
                )}

                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsGetStartedOpen(true);
                  }}
                  className="w-full text-center bg-brand-primary text-white py-3 rounded-full text-xs font-semibold hover:bg-brand-accent mt-auto"
                >
                  Get Creator Starter Kit
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* LOGIN OVERLAY MODAL */}
      <AnimatePresence>
        {isLoginOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLoginOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-black/5 overflow-hidden p-8 z-10"
            >
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-2xl bg-brand-bg border border-black/5 flex items-center justify-center mx-auto mb-3">
                  <User className="w-5 h-5 text-black" />
                </div>
                <h3 className="font-display font-bold text-xl text-black">Creator Portal</h3>
                <p className="text-xs text-black/50 mt-1">
                  Access purchased files, license keys, and community assets
                </p>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-mono text-black/60 uppercase tracking-widest mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="you@creator.com"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-black/5 bg-brand-bg outline-none text-sm text-black focus:border-black/20"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-black/60 uppercase tracking-widest mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-black/5 bg-brand-bg outline-none text-sm text-black focus:border-black/20"
                  />
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center space-x-2 text-black/60 cursor-pointer">
                    <input type="checkbox" className="rounded border-black/10 text-black focus:ring-0" />
                    <span>Remember this machine</span>
                  </label>
                  <span className="text-black/40 hover:text-black cursor-pointer">Forgot?</span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-brand-primary text-white py-3 rounded-xl font-semibold hover:bg-brand-accent transition-colors mt-2 text-sm"
                >
                  {isSubmitting ? "Verifying signature credentials..." : "Sign In with Security"}
                </button>
              </form>

              <button
                onClick={() => setIsLoginOpen(false)}
                className="mt-4 w-full text-center text-xs text-black/50 hover:text-black"
              >
                Cancel & return home
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* GET STARTED OVERLAY MODAL */}
      <AnimatePresence>
        {isGetStartedOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsGetStartedOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-black/5 overflow-hidden z-10"
            >
              <div className="p-8">
                <div className="flex items-center space-x-2 inline-flex bg-brand-primary/10 text-brand-primary px-3 py-1 rounded-full text-xs font-semibold mb-4">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Complimentary Starter Kit</span>
                </div>

                <h3 className="font-display font-bold text-2xl text-black">
                  Accelerate Your Visual Craft
                </h3>
                <p className="text-sm text-black/60 mt-2 leading-relaxed">
                  Join 5,000+ top motion designers and editors. Register a global designer account and claim our exclusive free bundle containing:
                </p>

                <div className="mt-5 space-y-2.5">
                  {[
                    "5 Aether cinematic impact hits (24-bit WAV)",
                    "3 Essential MOGRT lower-thirds with auto resizing",
                    "2 PremiumBlock cine-color grades (Rec.709 Cube)",
                    "High resolution foley loop assets"
                  ].map((benefit, idx) => (
                    <div key={idx} className="flex items-start text-xs font-medium text-black">
                      <div className="w-5 h-5 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary mr-2.5 mt-0.5 shrink-0">
                        <Check className="w-3 h-3" />
                      </div>
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-6 border-t border-black/5 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleCopyLink}
                    className="flex-1 border border-black/10 px-5 py-3 rounded-full text-xs font-semibold hover:bg-black/5 flex items-center justify-center space-x-2"
                  >
                    <Download className="w-4 h-4 text-black/60" />
                    <span>{copiedKit ? "Link Copied!" : "Copy Bundle Link"}</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsGetStartedOpen(false);
                      scrollToSection("shop");
                    }}
                    className="flex-1 bg-brand-primary text-white px-5 py-3 rounded-full text-xs font-semibold hover:bg-brand-accent flex items-center justify-center space-x-1.5"
                  >
                    <span>Browse Premium Assets</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="bg-brand-bg px-8 py-4 border-t border-black/5 text-[11px] text-black/40 text-center">
                Signing up registers you for our weekly product catalog expansion releases.
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </header>
  );
}
