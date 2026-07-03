import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  ShoppingCart,
  Menu,
  X,
  ArrowRight,
  Sparkles,
  User,
  Check,
  Download,
  Settings,
  HelpCircle,
  Globe,
  FileText,
  Briefcase,
  LogOut,
  Heart,
} from "lucide-react";
import { Product } from "../types";
import { PRODUCTS_DATA } from "../data";
import { logout as firebaseLogout } from "../services/authService";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";

interface NavbarProps {
  cart: Product[];
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  openProductPreview: (product: Product) => void;
  scrollToSection: (id: string) => void;
  isLoginOpen?: boolean;
  setIsLoginOpen?: (open: boolean) => void;
  isLoggedIn: boolean;
  setIsLoggedIn: (loggedIn: boolean) => void;
  userEmail: string;
  setUserEmail: (email: string) => void;
  wishlist?: Product[];
}

export default function Navbar({
  cart,
  removeFromCart,
  clearCart,
  openProductPreview,
  scrollToSection,
  isLoginOpen,
  setIsLoginOpen,
  isLoggedIn,
  setIsLoggedIn,
  userEmail,
  setUserEmail,
  wishlist = [],
}: NavbarProps) {
  const navigate = useNavigate();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isGetStartedOpen, setIsGetStartedOpen] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedKit, setCopiedKit] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileUpdates, setProfileUpdates] = useState(0);

  useEffect(() => {
    const handleProfileUpdate = () => {
      setProfileUpdates(prev => prev + 1);
    };
    window.addEventListener("profileUpdated", handleProfileUpdate);
    return () => {
      window.removeEventListener("profileUpdated", handleProfileUpdate);
    };
  }, []);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".profile-dropdown-container")) {
        setIsProfileOpen(false);
      }
    };
    if (isProfileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProfileOpen]);

  const getUserAvatarUrl = () => {
    return auth.currentUser?.photoURL || null;
  };

  const getInitials = () => {
    const name =
      localStorage.getItem("profile_name") ||
      auth.currentUser?.displayName ||
      userEmail ||
      "My Account";
    return name.charAt(0).toUpperCase();
  };

  // Filter products based on search query
  const filteredProducts = searchQuery.trim()
    ? PRODUCTS_DATA.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : PRODUCTS_DATA.slice(0, 3); // Quick suggestions

  const handleSignout = async () => {
    try {
      await firebaseLogout();
    } catch (err) {
      console.error(err);
    }
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
      alert(
        "Demo Order Processed Successfully! Your files have been compiled. In a real environment, this starts your cloud downloads instantly.",
      );
      clearCart();
      setIsCartOpen(false);
    }, 1500);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-brand-bg/80 backdrop-blur-md border-b border-black/5">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <button
          onClick={() => scrollToSection("hero")}
          className="flex items-center space-x-3 group cursor-pointer"
        >
          <div className="w-10 h-10 flex items-center justify-center shrink-0 relative overflow-hidden rounded-lg">
            <img
              src="https://res.cloudinary.com/df5rgwdng/image/upload/v1782835978/Logo_A_yl3rjd.png"
              alt="Editors Hub Logo"
              className="w-full h-full object-cover origin-center group-hover:scale-110 transition-transform duration-300"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="flex flex-col items-start translate-y-[1px]">
            <span className="font-display font-bold tracking-tight text-lg text-black leading-none">
              Editors Hub
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

          {/* Account Portal Sign In / Account status with LinkedIn-style dropdown popup */}
          {isLoggedIn ? (
            <div className="relative profile-dropdown-container">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="hidden md:flex items-center space-x-2 border border-black/10 text-black/80 hover:bg-black/5 text-xs font-semibold pl-2 pr-4 py-1.5 rounded-full transition-all cursor-pointer"
              >
                {getUserAvatarUrl() ? (
                  <img
                    src={getUserAvatarUrl()!}
                    alt="Profile"
                    className="w-6 h-6 rounded-full object-cover border border-black/5"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-brand-primary to-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">
                    {getInitials()}
                  </div>
                )}
                <span className="max-w-[120px] truncate">
                  {localStorage.getItem("profile_name") || auth.currentUser?.displayName || auth.currentUser?.email?.split("@")[0] || "My Account"}
                </span>
                <span
                  className="text-[9px] text-black/40 transition-transform duration-200"
                  style={{
                    transform: isProfileOpen ? "rotate(180deg)" : "none",
                  }}
                >
                  ▼
                </span>
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-[0_15px_50px_rgba(0,0,0,0.15)] border border-black/5 overflow-hidden text-left z-50 py-4 font-sans"
                  >
                    {/* Header profile info */}
                    <div className="px-4 pb-4 border-b border-black/5">
                      <div className="flex items-start space-x-3">
                        {getUserAvatarUrl() ? (
                          <img
                            src={getUserAvatarUrl()!}
                            alt="Profile Avatar"
                            className="w-12 h-12 rounded-full object-cover bg-black/5 border border-black/10 shrink-0"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-primary to-indigo-600 text-white flex items-center justify-center text-xl font-bold border border-black/10 shrink-0">
                            {getInitials()}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-1.5">
                            <h4 className="font-bold text-sm text-black truncate leading-tight">
                              {localStorage.getItem("profile_name") ||
                                auth.currentUser?.displayName ||
                                userEmail.split("@")[0] ||
                                "Aniket Visuals"}
                            </h4>
                          </div>
                          <p className="text-[11px] text-black/60 leading-tight mt-1 font-medium line-clamp-3">
                            {localStorage.getItem("profile_bio_text") ||
                              "Hi 👋, I'm Ronald, a passionate UX designer with 10 years of experience in creating intuitive and user-centered digital experiences."}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mt-4">
                        <button
                          onClick={() => {
                            setIsProfileOpen(false);
                            navigate("/portal");
                          }}
                          className="w-full text-center border border-black/15 hover:bg-black/[0.02] active:bg-black/[0.04] text-black text-xs font-bold py-2 px-3 rounded-full transition-all cursor-pointer flex items-center justify-center"
                        >
                          <span>Manage Profile</span>
                        </button>
                        <button
                          onClick={() => {
                            setIsProfileOpen(false);
                            navigate("/portal", { state: { tab: "settings" } });
                          }}
                          className="w-full text-center bg-black/5 hover:bg-black/10 text-black text-xs font-bold py-2 px-3 rounded-full transition-all cursor-pointer flex items-center justify-center"
                        >
                          <span>Settings</span>
                        </button>
                      </div>
                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          navigate("/portal", { state: { tab: "wishlist" } });
                        }}
                        className="w-full mt-2 text-center bg-black/5 hover:bg-black/10 text-black text-xs font-bold py-2 px-3 rounded-full transition-all cursor-pointer flex items-center justify-center space-x-2"
                      >
                        <Heart className="w-3.5 h-3.5" />
                        <span>My Wishlist</span>
                      </button>
                    </div>

                    {/* Sign Out Section */}
                    <div className="px-2 pt-2">
                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          handleSignout();
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-red-50 hover:text-red-600 text-xs text-black/60 font-semibold transition-all cursor-pointer flex items-center space-x-2 group"
                      >
                        <LogOut className="w-4 h-4 text-black/40 group-hover:text-red-600 transition-colors" />
                        <span>Sign out</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button
              onClick={() => navigate("/portal")}
              className="hidden md:flex items-center space-x-2 border border-black/10 text-black/80 hover:bg-black/5 text-xs font-semibold px-4 py-2.5 rounded-full transition-all cursor-pointer"
            >
              <User className="w-4 h-4 text-black/60" />
              <span>Sign In</span>
            </button>
          )}

          {/* Mobile Menu Icon */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden w-10 h-10 rounded-full flex items-center justify-center hover:bg-black/5 transition-colors text-black"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>
      </header>

      {/* --- MODALS & DRAWER REVIEWS --- */}

      {/* SEARCH SPOTLIGHT OVERLAY */}
      <AnimatePresence>
        {isSearchOpen && (
          <div className="fixed inset-0 z-[100] flex items-start justify-center pt-24 px-4">
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
                      <p className="text-sm text-black/50">
                        No assets match "{searchQuery}"
                      </p>
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
                <span>
                  Select an asset to view quick file details & play preview
                </span>
                <span className="font-mono">Editors Hub v1.0.4</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SHOPPING CART DRAWER */}
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 z-[100] flex justify-end">
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
                  <span className="font-display font-bold text-lg text-black">
                    Your Cart
                  </span>
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
                    <p className="text-sm font-semibold text-black">
                      Your cart is empty
                    </p>
                    <p className="text-xs text-black/50 mt-1 max-w-[200px] mx-auto">
                      Explore our premium marketplace assets and speed up your
                      workflow today.
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
                          <span className="text-sm font-semibold">
                            ${item.price}
                          </span>
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
                    <span>
                      {isSubmitting
                        ? "Processing secure path..."
                        : "Complete Checkout"}
                    </span>
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
          <div className="fixed inset-0 z-[100] md:hidden flex justify-end">
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
                <span className="font-display font-bold text-lg text-black">
                  Menu Navigation
                </span>
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
                  <div className="space-y-3">
                    <p className="text-xs text-black/50 font-mono">
                      Logged in as {userEmail}
                    </p>
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        navigate("/portal");
                      }}
                      className="w-full text-center border border-black/10 py-2.5 rounded-full text-xs font-semibold"
                    >
                      Account & Sheet Sync
                    </button>
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
                      navigate("/portal");
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

      {/* GET STARTED OVERLAY MODAL */}
      <AnimatePresence>
        {isGetStartedOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
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
                  Join 5,000+ top motion designers and editors. Register a
                  global designer account and claim our exclusive free bundle
                  containing:
                </p>

                <div className="mt-5 space-y-2.5">
                  {[
                    "5 Aether cinematic impact hits (24-bit WAV)",
                    "3 Essential MOGRT lower-thirds with auto resizing",
                    "2 PremiumBlock cine-color grades (Rec.709 Cube)",
                    "High resolution foley loop assets",
                  ].map((benefit, idx) => (
                    <div
                      key={idx}
                      className="flex items-start text-xs font-medium text-black"
                    >
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
                    <span>
                      {copiedKit ? "Link Copied!" : "Copy Bundle Link"}
                    </span>
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
                Signing up registers you for our weekly product catalog
                expansion releases.
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
